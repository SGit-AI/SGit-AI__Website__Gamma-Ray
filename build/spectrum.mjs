// GAMMA-Ray Spectrum: the deterministic scorer. Reads data/spectrum.json and a scan's answers; returns the card.
// Levels are computed from indicators by published rules; nothing here judges a level.
// A rule is an indicator id, {all: [...]}, {any: [...]}, {count: n, of: [...]} or {level: n} (a lower level of the same
// dimension). A public card counts every documented answer; an answer that is only available is marked as such.
import fs from 'node:fs'
import path from 'node:path'

export function loadSpectrum(root) { return JSON.parse(fs.readFileSync(path.join(root, 'data/spectrum.json'), 'utf8')) }

const ids = r => typeof r === 'string' ? [r] : r.level ? [] : (r.all || r.any || r.of).flatMap(ids)
function test(rule, has, met) {
    if (typeof rule === 'string') return has(rule)
    if (rule.level) return !!met[rule.level]
    if (rule.all) return rule.all.every(r => test(r, has, met))
    if (rule.any) return rule.any.some(r => test(r, has, met))
    if (rule.count) return rule.of.filter(r => test(r, has, met)).length >= rule.count
    return false
}
// the smallest set of indicators that would make a rule true, given what is already there
function missing(rule, has, met) {
    if (test(rule, has, met)) return []
    if (typeof rule === 'string') return [rule]
    if (rule.level) return null                       // a lower level is its own unlock
    if (rule.all) { const parts = rule.all.map(r => missing(r, has, met)); return parts.some(p => p === null) ? null : parts.flat() }
    if (rule.any) { const opts = rule.any.map(r => missing(r, has, met)).filter(p => p !== null).sort((a, b) => a.length - b.length); return opts[0] ?? null }
    if (rule.count) { const need = rule.count - rule.of.filter(r => test(r, has, met)).length, opts = rule.of.filter(r => !test(r, has, met)).map(r => missing(r, has, met)).filter(Boolean).sort((a, b) => a.length - b.length); return opts.slice(0, need).flat() }
    return null
}

export function card(scan, sp, m) {
    const A = scan.answers, has = id => !!A[id]
    const dims = sp.dimensions.map(d => {
        const met = {}
        for (const l of d.levels) met[l.level] = test(l.rule, has, met)
        let level = 0
        if (d.ladder === 'cumulative') { for (const l of d.levels) { if (met[l.level]) level = l.level; else break } }
        else for (const l of d.levels) if (met[l.level]) level = l.level
        const L = d.levels.find(l => l.level === level) || null
        // the next level to aim at: the one above (a cumulative ladder), or the higher level that needs the fewest new facts
        const higher = d.levels.filter(l => l.level > level).map(l => ({ l, need: missing(l.rule, has, met) })).filter(x => x.need && x.need.length)
        const pick = d.ladder === 'cumulative' ? higher.find(x => x.l.level === level + 1) : higher.sort((a, b) => a.need.length - b.need.length || b.l.level - a.l.level)[0]
        const next = pick ? pick.l : null, need = pick ? pick.need : null
        const used = L ? ids(L.rule).filter(has) : []
        const beyond = d.levels.filter(l => l.level > level + 1 && met[l.level]).map(l => l.level)
        // which configuration the level holds in: the level with only what holds as shipped (or in the deployment),
        // and the named configurations of every available fact the level rests on, down the ladder
        const hasShipped = id => !!A[id] && A[id].m !== 'available', metS = {}
        for (const l of d.levels) metS[l.level] = test(l.rule, hasShipped, metS)
        let shipped = 0
        if (d.ladder === 'cumulative') { for (const l of d.levels) { if (metS[l.level]) shipped = l.level; else break } }
        else for (const l of d.levels) if (metS[l.level]) shipped = l.level
        const chain = [...new Set(d.levels.filter(l => l.level <= level && met[l.level]).flatMap(l => ids(l.rule)))].filter(has)
        const cfgName = tag => { const c = (scan.configurations || []).find(c => (c.on || []).includes(tag)); return c ? c.name : tag }
        const withCfg = shipped === level ? [] : [...new Set(chain.filter(id => A[id].m === 'available').map(id => cfgName(A[id].cfg || 'an option turned on')))]
        const SL = d.levels.find(l => l.level === shipped) || null
        return { id: d.id, name: d.name, level, levelName: L ? L.name : null, means: L ? L.means : null, used, shipped, shippedName: SL ? SL.name : null, withCfg, available: shipped === level ? [] : ['available'], next: next ? { level: next.level, name: next.name, need } : null, beyond }
    })
    const lv = Object.fromEntries(dims.map(d => [d.id, d.level])), sum = dims.reduce((n, d) => n + d.level, 0)
    const stage = sp.stages.find(s => sum >= s.min && sum <= s.max) || null
    const badges = []
    if (has('S1')) badges.push('in-production')
    if (lv.A >= 1 && lv.C >= lv.A - 1 && lv.O >= lv.A - 1) badges.push('balanced')
    if (lv.R >= 3) badges.push('open-protocol')
    if (lv.O >= 3 && has('I50')) badges.push('shows-its-work')
    if (lv.O >= 4) badges.push('verified')
    if (scan.claimed_by_operator) badges.push('claimed')
    // the constellation: provisions that the evidenced indicators touch, per instrument, against the public-readable share
    const lit = new Set(Object.keys(A).flatMap(id => (m.I.get(id)?.links || []).map(l => l.provision)))
    const constellation = m.standards.map(s => ({ id: s.id, name: s.short, lit: m.provisions.filter(p => p.standard === s.id && lit.has(p.id)).length, readable: s.tiers.public })).map(c => ({ ...c, readable: Math.max(c.readable, c.lit) }))
    // the next unlock: the dimension whose next level needs the fewest new facts
    const unlock = dims.filter(d => d.next && d.next.need && d.next.need.length).sort((a, b) => a.next.need.length - b.next.need.length || a.level - b.level)[0] || null
    // the standout: the highest level reached, and the evidence behind it
    const top = [...dims].sort((a, b) => b.level - a.level)[0]
    const sources = new Set(Object.values(A).map(a => a.e))
    return { signature: dims.map(d => d.id + (d.level || '–')).join(' · '), dims, sum, stage: stage ? stage.name : null, publishable: dims.some(d => d.level >= 1), badges, constellation, lit: lit.size, instruments: constellation.filter(c => c.lit).length, unlock, standout: top && top.level ? top : null, sources: sources.size, answers: Object.keys(A).length }
}

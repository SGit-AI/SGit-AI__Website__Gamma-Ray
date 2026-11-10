// The model: reads data/, links the three layers, computes coverage, levels and scans.
// Everything a page shows is computed here from the data files; nothing is typed into a page.
import fs from 'node:fs'
import path from 'node:path'

const read = f => JSON.parse(fs.readFileSync(f, 'utf8'))
export const TIERS = ['public', 'declared', 'evidenced']
export const TIER_LABEL = { public: 'Public', declared: 'Declared', evidenced: 'Evidenced' }

export function load(root) {
    const d = f => path.join(root, 'data', f)
    const standards = read(d('standards.json')), provisions = read(d('provisions.json'))
    const indicators = read(d('indicators.json')), questions = read(d('questions.json')), levels = read(d('levels.json'))
    const scans = fs.readdirSync(d('scans')).filter(f => f.endsWith('.json')).sort().map(f => read(d('scans/' + f)))
    const P = new Map(provisions.map(p => [p.id, p])), I = new Map(indicators.map(i => [i.id, i])), S = new Map(standards.map(s => [s.id, s]))

    // each provision: the indicators that cite it, and the lowest tier at which it can be answered
    for (const p of provisions) { p.by = []; p.tier = null }
    for (const i of indicators) for (const l of i.links) {
        const p = P.get(l.provision); if (!p) continue
        p.by.push({ indicator: i.id, relation: l.relation })
        if (p.tier === null || TIERS.indexOf(i.tier) < TIERS.indexOf(p.tier)) p.tier = i.tier
    }
    for (const s of standards) {
        const ps = provisions.filter(p => p.standard === s.id)
        s.n = ps.length; s.linked = ps.filter(p => p.by.length).length
        s.tiers = Object.fromEntries(TIERS.map(t => [t, ps.filter(p => p.tier === t).length]))
        s.outliers = ps.filter(p => !p.by.length)
    }
    for (const q of questions) {
        q.ind = q.indicators.map(id => I.get(id))
        q.provisions = [...new Set(q.ind.flatMap(i => i.links.map(l => l.provision)))]
        q.standards = [...new Set(q.provisions.map(id => P.get(id).standard))]
        q.tier = TIERS.find(t => q.ind.some(i => i.tier === t))
    }
    const totals = {
        provisions: provisions.length, linked: provisions.filter(p => p.by.length).length, indicators: indicators.length,
        questions: questions.length, standards: standards.length, links: indicators.reduce((n, i) => n + i.links.length, 0),
        byTier: Object.fromEntries(TIERS.map(t => [t, indicators.filter(i => i.tier === t).length])),
        shared: indicators.filter(i => new Set(i.links.map(l => P.get(l.provision).standard)).size >= 3).length
    }
    for (const sc of scans) Object.assign(sc, score(sc, levels))
    return { standards, provisions, indicators, questions, levels, scans, P, I, S, totals }
}

// The levels are patterns over indicators (data/levels.json states them in words; this is the same rule in code).
export function score(scan, levels) {
    const y = id => !!scan.answers[id], any = (...ids) => ids.some(y), all = (...ids) => ids.every(y)
    let f = 1
    if (y('I16') || (y('I07') && any('I02', 'I03', 'I04', 'I05'))) f = 2
    if (y('I08') && any('I17', 'I18', 'I19')) f = 3
    if (f === 3 && any('I04', 'I10', 'I11')) f = 4
    if (f === 4 && any('I12', 'I13') && any('I18', 'I19')) f = 5
    let g = 0; const missing = []
    const step = (lvl, parts) => {          // parts: [label, ok, ids]
        if (g !== lvl - 1) return
        const not = parts.filter(p => !p[1])
        if (not.length === 0) g = lvl; else if (!missing.length) missing.push(...not.map(p => ({ for: lvl, need: p[0], ids: p[2] })))
    }
    step(1, [['what it is for is written down', y('I20'), ['I20']], ['a policy or written rules', any('I34', 'I47'), ['I34', 'I47']]])
    step(2, [['a named owner or accountable person', any('I30', 'I32'), ['I30', 'I32']], ['a person can approve or stop', any('I38', 'I39'), ['I38', 'I39']], ['its actions are logged', y('I41'), ['I41']]])
    step(3, [['what it can reach is enumerated', y('I23'), ['I23']], ['a limit enforced outside its own reach', y('I45'), ['I45']], ['it is monitored in operation', y('I43'), ['I43']]])
    step(4, [['test or evaluation results are published', y('I50'), ['I50']], ['an independent check', any('I52', 'I63', 'I64'), ['I52', 'I63', 'I64']]])
    const clears = levels.governance[g].clears, held = Math.min(f, clears)
    return { freedom: f, governance: g, clears, held, gap: f - held, workOrder: missing, evidenced: Object.keys(scan.answers).length }
}

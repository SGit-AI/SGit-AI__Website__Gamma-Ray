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
    const lens = read(d('lens.json'))
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
    // how the instruments connect: for each pair, the indicators that cite both
    const stdOf = i => [...new Set(i.links.map(l => P.get(l.provision).standard))]
    const pairs = {}
    for (const i of indicators) { const ss = stdOf(i); for (const a of ss) for (const b of ss) if (a < b) (pairs[a + '|' + b] = pairs[a + '|' + b] || []).push(i.id) }
    for (const s of standards) s.indicators = indicators.filter(i => stdOf(i).includes(s.id)).length
    totals.pairs = Object.keys(pairs).length; totals.lens = indicators.filter(i => i.lens).length
    for (const sc of scans) Object.assign(sc, score(sc, levels, I, lens), { g: grant(sc, lens) })
    scans.sort((a, b) => (b.ours ? 1 : 0) - (a.ours ? 1 : 0) || a.name.localeCompare(b.name))
    return { standards, provisions, indicators, questions, levels, scans, lens, pairs, stdOf, P, I, S, totals }
}

// The grant, the mandate and the delta: RiskMandate's measurement, taken from a published profile. Counted, never scored.
export function grant(scan, lens) {
    if (!scan.grant) return null
    const rows = scan.grant.rows, isControl = Object.fromEntries(lens.barriers.map(b => [b.id, b.is_control]))
    const by = Object.fromEntries(lens.barriers.map(b => [b.id, rows.filter(r => r.barrier === b.id).length]))
    const measured = rows.filter(r => ['observed', 'measured'].includes(r.evidence)).length
    const out = { size: rows.length, by, bounded: rows.filter(r => isControl[r.barrier]).length, unbounded: rows.filter(r => !isControl[r.barrier]).length, measured }
    if (scan.mandate) {
        const want = new Set(scan.mandate.want), have = new Set(rows.map(r => r.capability))
        const excess = rows.filter(r => !want.has(r.capability))
        out.delta = { wanted: want.size, aligned: rows.filter(r => want.has(r.capability)).length, excess: excess.length, unboundedExcess: excess.filter(r => !isControl[r.barrier]).length, shortfall: [...want].filter(c => !have.has(c)).length }
    }
    return out
}

// The levels are patterns over indicators (data/levels.json states them in words; this is the same rule in code).
//
// Eligibility. An indicator is a statement fact (the publication is itself the evidence: a purpose written down, an
// owner named) or an operation fact (something that has to be true while the agent runs: it is logged, it is watched).
// A statement fact counts with any grade. An operation fact counts only when its grade is observed or measured;
// otherwise it is CLAIMED: shown, and not counted towards the level held.
// Scope. Two facts are read from a measured grant and never from words: I23 (the grant is enumerated: a profile whose
// rows are mostly observed or measured) and I45 (bounded: every capability in the grant whose effect cannot be undone
// sits behind a boundary).
// A product is not given a governance level or a level held: those belong to a deployment. A product gets a freedom
// level for each named configuration, and the list of controls that configuration brings.
const STRONG = new Set(['observed', 'measured'])
const GOV = [
    [1, [['what it is for is written down', ['I20']], ['a policy in force, or written rules', ['I34', 'I47']]]],
    [2, [['a named owner or accountable person', ['I30', 'I32']], ['a person can approve or stop', ['I38', 'I39']], ['its actions are logged', ['I41']]]],
    [3, [['the grant is enumerated, from a measured profile', ['I23']], ['every capability that cannot be undone is behind a boundary', ['I45']], ['it is monitored in operation', ['I43']]]],
    [4, [['test or evaluation results are published', ['I50']], ['an independent check', ['I52', 'I63', 'I64']]]]
]
function ladder(y) {
    const any = (...ids) => ids.some(y)
    let f = 1
    if (y('I16') || (y('I07') && any('I02', 'I03', 'I04', 'I05'))) f = 2
    if (y('I08') && any('I17', 'I18', 'I19')) f = 3
    if (f === 3 && any('I04', 'I10', 'I11')) f = 4
    if (f === 4 && any('I12', 'I13') && any('I18', 'I19')) f = 5
    let g = 0, missing = []
    for (const [lvl, parts] of GOV) { const not = parts.filter(p => !p[1].some(y)); if (not.length) { missing = not.map(p => ({ for: lvl, need: p[0], ids: p[1] })); break } g = lvl }
    return { freedom: f, governance: g, missing }
}
export function score(scan, levels, I, lens) {
    const A = scan.answers, undo = Object.fromEntries(lens.capabilities.map(c => [c.id, c.undo])), rows = scan.grant ? scan.grant.rows : null
    const irreversible = rows ? rows.filter(r => undo[r.capability] === 'no') : [], loose = irreversible.filter(r => r.barrier !== 'boundary')
    const refused = rows && scan.mandate ? rows.filter(r => (scan.mandate.do_not_want || []).includes(r.capability)) : []
    const fromGrant = rows ? { I23: rows.filter(r => STRONG.has(r.evidence)).length * 2 >= rows.length, I45: irreversible.length > 0 && loose.length === 0 } : { I23: false, I45: false }
    const eligible = id => A[id] && (I.get(id).needs === 'statement' || STRONG.has(A[id].g))
    if (scan.kind === 'product-shape') {
        const configs = (scan.configurations || [{ id: 'shipped', name: 'As shipped', note: '', on: [] }]).map(c => {
            const on = id => A[id] && (A[id].m === 'default' || (A[id].m === 'available' && c.on.includes(A[id].cfg)))
            const l = ladder(on), ids = Object.keys(A).filter(on)
            return { ...c, freedom: l.freedom, controls: ids.filter(id => I.get(id).question > 'Q05'), added: ids.filter(id => A[id].m === 'available') }
        })
        const fs_ = configs.map(c => c.freedom)
        return { product: true, freedom: configs[0].freedom, freedomMax: Math.max(...fs_), configs, governance: null, held: null, workOrder: [], evidenced: Object.values(A).filter(a => a.m !== 'available').length, available: Object.values(A).filter(a => a.m === 'available').length, irreversible: irreversible.length, loose: loose.length }
    }
    const claimed = ladder(id => id in fromGrant && rows ? fromGrant[id] || !!A[id] : !!A[id])
    const ev = ladder(id => id in fromGrant ? fromGrant[id] : eligible(id))
    const clears = g => levels.governance[g].clears
    const work = []
    for (const r of refused.filter(r => r.barrier !== 'boundary')) work.push({ type: 'refused', text: `\`${r.capability}\` is refused by the mandate and is in the grant with ${r.barrier === 'none' ? 'nothing' : 'only a ' + r.barrier} in the way`, capability: r.capability })
    if (rows && loose.length) work.push({ type: 'unbounded', text: `${loose.length} of the ${irreversible.length} capabilities in the grant whose effect cannot be undone are not behind a boundary: ${loose.map(r => '`' + r.capability + '`').join(', ')}` })
    for (const x of ev.missing) { const cl = x.ids.filter(id => A[id] && !(id in fromGrant)); work.push({ type: cl.length ? 'claimed' : 'missing', for: x.for, need: x.need, ids: x.ids, text: cl.length ? `${x.need}: stated, but known only as ${cl.map(id => A[id].g).join(', ')}; it has to be observed or measured to count` : (x.ids.some(id => id in fromGrant) ? (rows ? `${x.need}` : `${x.need}: no grant has been measured`) : `${x.need}: not evidenced`) }) }
    const held = Math.min(ev.freedom, clears(ev.governance)), claimedHeld = Math.min(claimed.freedom, clears(claimed.governance))
    return { product: false, freedom: ev.freedom, governance: ev.governance, clears: clears(ev.governance), held, gap: ev.freedom - held, claimed: { governance: claimed.governance, held: claimedHeld }, nextLevel: ev.missing.length ? ev.missing[0].for : null, workOrder: work,
        evidenced: Object.keys(A).filter(eligible).length, claimedOnly: Object.keys(A).filter(id => !eligible(id)).length, available: 0, irreversible: irreversible.length, loose: loose.length, refused: refused.length }
}

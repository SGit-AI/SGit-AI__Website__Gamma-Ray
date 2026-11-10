// One graph per card, in the grammar of Fractal Semantic Graphs (graphs.sgit.ai): every edge is a directed verb with a
// named inverse, no generic association, an absence is a node, and every evidence node carries the words it came from.
// The grammar is the same at every zoom; the vocabulary changes with the altitude (card, standard, evidence, people).
// Nothing here scores anything: it connects what the scorers already computed.
export const VERBS = [
    ['rated_on', 'rates', 'card', 'dimension', 'this card is rated on this dimension', 'card'],
    ['stands_at', 'held_by', 'dimension', 'level', 'this dimension stands at this level', 'card'],
    ['rests_on', 'supports', 'level', 'fact', 'this level rests on this fact', 'card'],
    ['awaits', 'would_unlock', 'dimension', 'question', 'this dimension awaits an answer to this open question', 'card'],
    ['backed_by', 'evidences', 'fact', 'evidence', 'this fact is backed by this evidence', 'evidence'],
    ['observed_on', 'bears_observation', 'evidence', 'source', 'this evidence was observed on this page', 'evidence'],
    ['produced_by', 'produced', 'evidence', 'actor', 'this evidence was produced by this actor', 'people'],
    ['checked_by', 'checked', 'evidence', 'actor', 'this evidence was checked by this actor', 'people'],
    ['matches', 'matched_by', 'fact', 'provision', 'this fact is what this provision asks', 'standard'],
    ['is_part_of', 'partly_met_by', 'fact', 'provision', 'this fact is one part of what this provision asks', 'standard'],
    ['negates', 'negated_by', 'fact', 'provision', 'this fact is the absence of what this provision asks', 'standard'],
    ['stated_in', 'states', 'provision', 'instrument', 'this provision is stated in this instrument', 'standard']
].map(([verb, inverse, from, to, reads, altitude]) => ({ verb, inverse, from, to, reads, altitude, in_the_fifteen: ['backed_by', 'observed_on'].includes(verb) }))
const REL = { same: 'matches', part: 'is_part_of', negation: 'negates' }

export function cardGraph(m, sp, s, c, trust) {
    const nodes = new Map(), edges = [], N = (id, type, label, extra = {}) => { if (!nodes.has(id)) nodes.set(id, { id, type, label, ...extra }); return id }, E = (from, verb, to) => edges.push({ from, verb, to })
    const card = N(`card:${s.id}`, 'card', s.name, { status: trust.status, signature: c.signature, url: `https://gamma-ray.sgit.ai/spectrum/cards/${s.id}/` })
    const fact = id => { const n = trust.byInd[id], a = s.answers[id], I = m.I.get(id), f = N(`fact:${s.id}/${id}`, 'fact', I.text, { indicator: id, kind: n.kind, trust: n.reads })
        if (!nodes.has(`evidence:${s.id}/${id}`)) { const ev = N(`evidence:${s.id}/${id}`, 'evidence', a.n, { sentence: a.span || null, read_at: n.top.record.read_at, sha256: n.top.record.sha256, mode: a.m })
            E(f, 'backed_by', ev); E(ev, 'observed_on', N(`source:${a.e}`, 'source', a.e, { url: a.e }))
            E(ev, 'produced_by', N(trust.producer, 'actor', trust.producer.slice(6))); for (const v of trust.validators) E(ev, 'checked_by', N(v, 'actor', v.slice(6)))
            for (const l of I.links || []) { const p = m.P.get(l.provision), S = m.S.get(p.standard); E(f, REL[l.relation], N(`provision:${p.id}`, 'provision', `${S.short}: ${p.ref}`, { url: `https://gamma-ray.sgit.ai/provisions/${p.id}/`, source_url: p.source_url })); if (!edges.some(e => e.from === `provision:${p.id}` && e.verb === 'stated_in')) E(`provision:${p.id}`, 'stated_in', N(`instrument:${S.id}`, 'instrument', S.name, { url: S.url })) } }
        return f }
    for (const d of c.dims) { const D = N(`dimension:${s.id}/${d.id}`, 'dimension', d.name); E(card, 'rated_on', D)
        if (d.level) { const L = N(`level:${s.id}/${d.id}${d.level}`, 'level', `${d.id}${d.level} ${d.levelName}`, { trust: null }); E(D, 'stands_at', L); for (const id of d.used) E(L, 'rests_on', fact(id)) }
        // an absence is a node: what is not yet evidenced, and what would unlock the next level
        for (const id of (d.next && d.next.need) || []) E(D, 'awaits', N(`question:${s.id}/${id}`, 'question', m.I.get(id).text, { indicator: id, answer: null, reads: 'not yet evidenced; not a no', would_reach: `${d.id}${d.next.level} ${d.next.name}` })) }
    for (const id of Object.keys(s.answers)) fact(id)       // facts on record that no level rests on are still in the graph
    return { card: s.id, grammar: 'Fractal Semantic Graphs: every edge a directed verb with a named inverse; an absence is a node', nodes: [...nodes.values()], edges }
}
// one path from the card down to a page, as sentences: the test that the edges read in plain language
export function walk(g) {
    const N = Object.fromEntries(g.nodes.map(n => [n.id, n])), out = e => g.edges.filter(x => x.from === e), V = Object.fromEntries(VERBS.map(v => [v.verb, v]))
    const lab = n => n.type === 'evidence' ? (n.sentence ? '"' + n.sentence + '"' : 'this evidence') : n.label
    const say = e => `**${lab(N[e.from])}** \`${e.verb}\` **${lab(N[e.to])}**`
    const path = []; let at = g.nodes.find(n => n.type === 'card').id
    for (const verb of ['rated_on', 'stands_at', 'rests_on', 'backed_by', 'observed_on']) { const opts = out(at).filter(e => e.verb === verb); const e = verb === 'rated_on' ? opts.find(o => out(o.to).some(x => x.verb === 'stands_at')) : verb === 'rests_on' ? opts.find(o => N[out(o.to).find(x => x.verb === 'backed_by')?.to]?.sentence) || opts[0] : opts[0]; if (!e) break; path.push(e); at = e.to }
    const f = path.find(e => e.verb === 'rests_on'), side = f ? out(f.to).filter(e => ['matches', 'is_part_of'].includes(e.verb)).slice(0, 2) : [], chk = path.find(e => e.verb === 'backed_by') ? out(path.find(e => e.verb === 'backed_by').to).filter(e => ['produced_by', 'checked_by'].includes(e.verb)) : []
    return { down: path.map(say), across: side.map(say), who: chk.map(say), V }
}

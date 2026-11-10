// FACT-Ray: the deterministic scorer. Reads data/fact-ray/{axes,bands,caps,actors}.json; nothing here judges a fact.
// claim -> band (the Source by Record matrix, capped by Accountability) -> node band, marks and distribution.
// Same claims, same score. The tables are data: change them there, with a date, never here.
import fs from 'node:fs'
import path from 'node:path'

export function loadFactRay(root) {
    const r = f => JSON.parse(fs.readFileSync(path.join(root, 'data/fact-ray', f), 'utf8'))
    return { axes: r('axes.json'), bands: r('bands.json'), caps: r('caps.json'), actors: r('actors.json') }
}

const rank = (fr, b) => fr.bands.order.indexOf(b)
// the band of one claim: the matrix cell, then the cap. Returns the cell too, so a page can show why.
export function claimBand(fr, c) {
    const S = c.source.level, R = c.record.level, A = c.accountability.level
    if (S === 'S0') return { band: null, cell: null, cap: null, capped: false }
    const cell = fr.bands.matrix[S][fr.bands.columns.indexOf(R)], cap = fr.caps.caps[A] ?? null
    const band = cap && rank(fr, cap) < rank(fr, cell) ? cap : cell
    return { band, cell, cap, capped: band !== cell }
}
// "S1·R5·A1 ×3 (same model family, shared repository)": the coordinates are always written with the band
export function coords(c, long = false) {
    const a = c.accountability
    return `${c.source.level}·${c.record.level}·${a.level}` + (a.count > 1 ? ` ×${a.count}` : '') + (long && a.independence ? ` (${a.independence})` : '')
}
export const pi = (fr, c, long = false) => { const b = claimBand(fr, c).band; return b ? `π ${b} · ${coords(c, long)}` : 'no data' }

// a node from its claims. kind: statement | operation. today: ISO date, for freshness.
export function node(fr, n, claims, today) {
    const scored = claims.map(c => ({ ...c, ...claimBand(fr, c) })).filter(c => c.band)
    if (!scored.length) return { ...n, claims: [], band: null, marks: [], satisfied: false, reads: 'no data' }
    const yes = scored.filter(c => c.asserts !== 'no'), top = [...scored].sort((a, b) => rank(fr, b.band) - rank(fr, a.band))[0]
    const marks = []
    const indep = new Set(yes.filter(c => rank(fr, c.band) >= rank(fr, 'Moderate')).map(c => c.source.actor || c.source.level))
    if (indep.size >= 2) marks.push('+')
    if (scored.some(c => c.asserts !== top.asserts && rank(fr, c.band) >= rank(fr, top.band))) marks.push('!')
    const at = top.record.read_at ? String(top.record.read_at).slice(0, 10) : null
    if (at && today && (Date.parse(today) - Date.parse(at)) / 864e5 > fr.axes.freshness_days) marks.push('stale')
    // an operation fact is satisfied only by a claim at R4 or above; a statement fact by any claim with a band
    const ok = c => c.asserts === 'yes' && (n.kind !== 'operation' || Number(c.record.level.slice(1)) >= 4)
    return { ...n, claims: scored, band: top.band, top, marks, satisfied: scored.some(ok), freshness: at, reads: `π ${top.band}${marks.filter(x => x !== 'stale').join('')} · ${coords(top)}` }
}
// a parent never averages its children: it shows their distribution
export function distribution(fr, nodes) {
    const d = {}; for (const n of nodes) { const k = n.band ? n.band + (n.marks.includes('+') ? '+' : '') : 'no data'; d[k] = (d[k] || 0) + 1 }
    const contested = nodes.filter(n => n.marks.includes('!')).length
    const order = [...fr.bands.order].reverse().flatMap(b => [b + '+', b]).concat('no data')
    return { counts: d, contested, total: nodes.length, text: `${nodes.length} fact${nodes.length === 1 ? '' : 's'}: ` + order.filter(k => d[k]).map(k => `${d[k]} ${k}`).join(', ') + (contested ? `, ${contested} contested` : '') }
}

// ---- GAMMA-Ray's evidence, as FACT-Ray claims. One answer of one scan is one fact node with one claim. ----
// Source: S1, an agent read public material and interpreted it (a subject's own well-known file would be S2).
// Record: R4 when the answer links a page anyone can open; R5 when that page is captured and hashed and a reviewer
//         other than the producer has been through the scan. Accountability: from the review rounds and the sign-off.
export function scanClaims(fr, scan, m, today, read = null) {
    // what the subject says in its own well-known file (tools/fact-ray.mjs read <domain> --save): S2, R4 with a page, A0 until checked
    const said = new Map(); if (read && read.file.kind === 'subject') for (const c of read.file.claims) { const k = c.node.startsWith('gamma-ray:indicator/') ? c.node.slice(20) : null; if (k) said.set(k, c) }
    const own = (ind, id) => { const c = said.get(ind); return c ? [{ id: `claim:well-known/${read.domain}/${ind}`, node: id, asserts: c.asserts, source: { level: 'S2', actor: `actor:domain/${read.domain}`, capacity: c.role }, record: { level: c.evidence?.length ? 'R4' : 'R3', url: c.evidence?.[0] || read.url, sha256: read.sha256, read_at: read.read_at, span: null }, accountability: { level: 'A0', producer: `actor:domain/${read.domain}`, validators: [], count: 1, independence: 'nobody but the subject', scope: [id] } }] : [] }
    const rv = scan.review || {}, rounds = rv.rounds || []
    const producer = 'actor:' + (scan.produced_by || (scan.assessment && scan.assessment.by) || 'gamma-ray@web-summit.dinis')
    const validators = [...new Set([...rounds.map(r => 'actor:' + r.by), ...(rv.signoff ? ['actor:' + rv.signoff.by] : [])])].filter(a => a !== producer)
    const human = rv.operator_signoff || null
    const A = human ? 'A4' : validators.length ? 'A1' : 'A0'
    const scopeAll = `node:gamma-ray/${scan.id}`
    const nodes = Object.entries(scan.answers).map(([ind, a]) => {
        const I = m.I.get(ind), cap = scan.captures?.[a.e], id = `node:gamma-ray/${scan.id}/${ind}`
        const R = cap?.sha256 && validators.length ? 'R5' : a.e ? 'R4' : 'R3'
        const signed = human && (!human.scope || human.scope.includes(ind) || human.scope.includes('*'))
        const claim = { id: `claim:gamma-ray/${scan.id}/${scan.read}/${ind}`, node: id, asserts: 'yes',
            source: { level: 'S1', actor: producer, capacity: 'an agent reading public pages' },
            record: { level: R, url: a.e, sha256: cap?.sha256 || null, read_at: cap?.read_at || scan.read, span: a.span || null },
            accountability: { level: signed ? 'A4' : validators.length ? 'A1' : 'A0', producer, validators: signed ? [...validators, 'actor:dinis-cruz'] : validators, count: 1 + validators.length + (signed ? 1 : 0), independence: validators.length ? 'same model family, shared repository' : 'nobody but the producer', scope: [signed ? id : scopeAll] } }
        return node(fr, { id, parent: scopeAll, kind: I.needs === 'operation' ? 'operation' : 'statement', text: I.text, indicator: ind }, [claim, ...own(ind, id)], today)
    })
    // what the subject says and no card fact holds yet: shown, never counted into a level
    const extra = [...said.keys()].filter(k => !scan.answers[k] && m.I.get(k)).map(k => { const id = `node:gamma-ray/${scan.id}/${k}`, I = m.I.get(k); return node(fr, { id, parent: scopeAll, kind: I.needs === 'operation' ? 'operation' : 'statement', text: I.text, indicator: k }, own(k, id), today) })
    // the status of the card follows trust: Draft (discovered, agent-reviewed), Confirmed (the company, on record), Attested (a customer, on record)
    const status = (scan.attestations || []).length ? 'Attested' : scan.claimed_by_operator || scan.confirmed_by_subject ? 'Confirmed' : 'Draft'
    return { said: extra, wellKnown: read ? { domain: read.domain, read_at: read.read_at, claims: said.size } : null, nodes, byInd: Object.fromEntries(nodes.map(n => [n.indicator, n])), producer, validators, level: A, status, distribution: distribution(fr, nodes), chain: [producer, ...validators] }
}
// the strongest band among the facts a level rests on, written with its coordinates
export function strongest(fr, nodes) {
    const s = nodes.filter(n => n && n.band).sort((a, b) => rank(fr, b.band) - rank(fr, a.band))[0]
    return s ? s.reads : null
}

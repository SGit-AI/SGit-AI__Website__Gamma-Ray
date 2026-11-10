// FACT-Ray on this site: the generated blocks of /fact-ray/, one page per provision, and the well-known files.
// Everything is computed from data/fact-ray/ and the scans by build/factray.mjs.
import fs from 'node:fs'
import path from 'node:path'
import { claimBand, coords, node, distribution } from './factray.mjs'
import { validate, readAs } from '../tools/fact-ray.mjs'

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const REL = { same: 'evidenced', part: 'partly evidenced', negation: 'its absence' }

export function build(root, m, sp, SPX, T, today) {
    const fr = T.fr, ax = id => fr.axes.axes.find(a => a.id === id)
    const ex = JSON.parse(fs.readFileSync(path.join(root, 'data/fact-ray/examples.json'), 'utf8'))
    const own = JSON.parse(fs.readFileSync(path.join(root, 'data/fact-ray/well-known.json'), 'utf8'))
    const ownBad = validate(own, own.issuer.domain)
    const live = [...T.of.entries()].flatMap(([scan, x]) => x.nodes.map(n => ({ scan, ...n })))
    const cellOf = n => n.top.source.level + n.top.record.level
    const scanName = id => m.scans.find(s => s.id === id).name
    const b = x => x ? `π ${x}` : 'none'

    // the matrix, as a grid of links to the cells' own entries below it
    const matrixHtml = () => `<div class="fr-matrix"><table><thead><tr><th></th>${fr.bands.columns.map(r => `<th>${r} ${ax('R').levels.find(l => 'R' + l.level === r).name}</th>`).join('')}</tr></thead><tbody>` +
        Object.entries(fr.bands.matrix).map(([s, row]) => `<tr><th>${s} ${ax('S').levels.find(l => 'S' + l.level === s).name}</th>${row.map((band, i) => { const id = s + fr.bands.columns[i], n = live.filter(x => cellOf(x) === id).length; return `<td class="fr-b fr-${band.toLowerCase()}"><a href="#${id}"><b>${band}</b>${n ? `<span>${n} live</span>` : ''}</a></td>` }).join('')}</tr>`).join('') + `</tbody></table></div>`
    const cellExamples = () => Object.entries(fr.bands.matrix).flatMap(([s, row]) => row.map((band, i) => { const r = fr.bands.columns[i], id = s + r, S = ax('S').levels.find(l => 'S' + l.level === s), R = ax('R').levels.find(l => 'R' + l.level === r)
        const here = live.filter(x => cellOf(x) === id), first = here[0]
        return `<h3 id="${id}">${s} ${S.name} · ${r} ${R.name}: ${band === 'none' ? 'no band' : 'π ' + band}</h3>\n\n${S.meaning}; ${R.meaning.charAt(0).toLowerCase() + R.meaning.slice(1)}. ` + (here.length ? `**${here.length} facts on this site sit in this cell** before the cap. One of them: "${first.text}" on [${scanName(first.scan)}](@@/spectrum/cards/${first.scan}/index.md), shown as ${first.reads}.` : 'No fact on this site sits in this cell yet.') })).join('\n\n')

    // the actors, with what the scans record of them
    const track = id => { const name = id.slice(6)
        const produced = [...T.of.values()].filter(x => x.producer === id), claims = produced.reduce((n, x) => n + x.nodes.length, 0)
        const rounds = m.scans.flatMap(s => (s.review?.rounds || []).filter(r => r.by === name).map(r => ({ s, r })))
        const signs = m.scans.filter(s => s.review?.signoff?.by === name).length
        const found = m.scans.filter(s => 'actor:' + (s.assessment?.by || 'gamma-ray@web-summit.dinis') === id).flatMap(s => (s.review?.rounds || []).flatMap(r => r.findings || [])).length
        return { claims, cards: produced.length, rounds: rounds.length, findings: rounds.reduce((n, x) => n + (x.r.findings || []).length, 0), signs, found } }
    const actorsMd = () => `| Actor | Kind | Role | Capacity, relative to these claims | Independence | On record so far |\n|---|---|---|---|---|---|\n` + fr.actors.actors.map(a => { const t = track(a.id)
        const rec = [t.claims ? `${t.claims} claims produced on ${t.cards} published card${t.cards === 1 ? '' : 's'}` : null, t.found ? `${t.found} review findings recorded against them` : null, t.rounds ? `${t.rounds} review rounds, ${t.findings} findings raised` : null, t.signs ? `${t.signs} card${t.signs === 1 ? '' : 's'} signed off` : null].filter(Boolean).join('; ') || a.track_record.note
        return `| \`${a.identity.name}\` | ${a.kind} | ${a.identity.role} | ${a.capacity} | ${a.independence} | ${rec} |` }).join('\n')

    // worked examples: the scorer runs on them at every build
    const exampleMd = e => { const nodes = e.nodes.map(n => node(fr, n, n.claims.map((c, i) => ({ id: `claim:${n.id.slice(5)}/${i + 1}`, node: n.id, ...c })), today))
        return `## ${e.title}\n\n${e.illustrative ? '*Illustrative: no real party. It shows how the tables behave.*\n\n' : ''}| The fact | Kind | Each claim: who says it, how recorded, who stands behind it | The fact reads |\n|---|---|---|---|\n` + nodes.map(n => `| ${n.text} | ${n.kind} | ${n.claims.length ? n.claims.map(c => `${c.asserts === 'no' ? '**Disagrees.** ' : ''}${c.source.capacity}: ${coords(c, true)}; matrix ${c.cell}${c.capped ? `, capped at ${c.cap} by ${c.accountability.level}` : ''}`).join('<br>') : 'no claim'} | ${n.band ? `**${n.reads}**${n.marks.includes('+') ? ' (corroborated)' : ''}${n.marks.includes('!') ? ' (contested: both claims are shown)' : ''}${n.kind === 'operation' && !n.satisfied ? '; shown, and does not satisfy an operation fact' : ''}` : '**no data** (not a no)'} |`).join('\n') + `\n\n**The parent shows the distribution, never an average:** ${distribution(fr, nodes).text}.` }
    const liveExample = () => { const spanned = live.filter(n => m.scans.find(x => x.id === n.scan).answers[n.indicator].span), approved = spanned.filter(n => m.scans.find(x => x.id === n.scan).review?.status === 'approved')
        const pick = approved.find(n => n.kind === 'operation') || approved[0] || spanned.find(n => n.top.record.level === 'R5') || live[0]; if (!pick) return ''
        const s = m.scans.find(x => x.id === pick.scan), a = s.answers[pick.indicator], c = pick.top
        return `## A level on a Spectrum card\n\n*Live: taken from a published card at this build.*\n\nThe fact: **"${pick.text}"**${a.span ? `, read from the words "${a.span}",` : ''} on [${s.name}](@@/spectrum/cards/${s.id}/index.md) (indicator \`${pick.indicator}\`, ${pick.kind === 'operation' ? 'an operation fact' : 'a statement fact'}).\n\n| Axis | Read as | Why |\n|---|---|---|\n| Source | ${c.source.level} ${ax('S').levels.find(l => 'S' + l.level === c.source.level).name} | An agent (\`${c.source.actor.slice(6)}\`) read [the public page](${a.e}) and interpreted it. The company has not said it to us. |\n| Record | ${c.record.level} ${ax('R').levels.find(l => 'R' + l.level === c.record.level).name} | ${c.record.sha256 ? 'The page was captured and hashed (sha256 `' + c.record.sha256.slice(0, 16) + '`, read ' + String(c.record.read_at).slice(0, 10) + ')' : 'The page is linked'}${c.accountability.validators.length ? ', and a reviewer other than the producer went through the scan' : '; nobody but the producer has checked the claim against it'}. |\n| Accountability | ${c.accountability.level}${c.accountability.count > 1 ? ' ×' + c.accountability.count : ''} | ${c.accountability.validators.length ? 'Checked by ' + c.accountability.validators.map(v => '`' + v.slice(6) + '`').join(' and ') + ': ' + c.accountability.independence + '. No human.' : 'Nobody else has checked it.'} |\n\nThe matrix gives ${c.source.level} by ${c.record.level} = **${c.cell}**. ${c.capped ? `Accountability ${c.accountability.level} caps it at **${c.cap}**.` : 'The cap does not lower it.'} The fact reads **${pick.reads}**.` }

    // where it is applied: every published card, with its distribution
    const appliedMd = () => `| Card | Status | The facts behind it | The chain |\n|---|---|---|---|\n` + SPX.cards.filter(x => x.c.publishable).map(({ s }) => { const x = T.of.get(s.id); return `| [${s.name}](@@/spectrum/cards/${s.id}/index.md) | ${x.status} | ${x.distribution.text.replace(/(\d+ )(Low|Moderate|High|Strong)/g, '$1π $2')} | ${x.nodes[0] ? coords(x.nodes[0].top, true) : ''} |` }).join('\n') + `\n\n**All of them together:** ${distribution(fr, live).text.replace(/(\d+ )(Low|Moderate|High|Strong)/g, '$1π $2')}.`

    // drafts of well-known files for our own agents, made from their scans, ready to be hosted on their domains
    const DOMAINS = { 'riskmandate-publisher': 'riskmandate.ai', 'promptugal-newsroom-team': 'promptugal.news' }
    const drafts = m.scans.filter(s => DOMAINS[s.id]).map(s => ({ domain: DOMAINS[s.id], file: { fact_ray: '0.1', kind: 'subject', issuer: { name: s.operator || s.name, domain: DOMAINS[s.id] }, subject: { name: s.name, domain: DOMAINS[s.id], product: s.name }, issued: today,
        claims: Object.entries(s.answers).map(([id, a]) => ({ node: `gamma-ray:indicator/${id}`, asserts: 'yes', statement: a.n, evidence: [a.e], role: 'to be named by the operator before this file is hosted', as_of: s.read })) } }))

    const gens = {
        'fr-version': () => fr.axes.version,
        'fr-axis-s': () => `| Level | Name | Meaning | On a Spectrum card | In a news story |\n|---|---|---|---|---|\n` + ax('S').levels.map(l => `| S${l.level} | **${l.name}** | ${l.meaning} | ${l.spectrum} | ${l.news} |`).join('\n'),
        'fr-axis-r': () => `| Level | Name | Meaning |\n|---|---|---|\n` + ax('R').levels.map(l => `| R${l.level} | **${l.name}** | ${l.meaning} |`).join('\n'),
        'fr-axis-a': () => `| Level | Name | Meaning |\n|---|---|---|\n` + ax('A').levels.map(l => `| A${l.level} | **${l.name}** | ${l.meaning} |`).join('\n'),
        'fr-matrix': () => matrixHtml(),
        'fr-matrix-md': () => `| | ${fr.bands.columns.map(r => `${r} ${ax('R').levels.find(l => 'R' + l.level === r).name}`).join(' | ')} |\n|---|${fr.bands.columns.map(() => '---').join('|')}|\n` + Object.entries(fr.bands.matrix).map(([s, row]) => `| **${s} ${ax('S').levels.find(l => 'S' + l.level === s).name}** | ${row.join(' | ')} |`).join('\n'),
        'fr-cells': () => cellExamples(),
        'fr-caps': () => `| Accountability | The band is capped at |\n|---|---|\n` + Object.entries(fr.caps.caps).map(([a, c]) => `| ${a} ${ax('A').levels.find(l => 'A' + l.level === a).name} | ${c || 'no cap'} |`).join('\n'),
        'fr-marks': () => Object.entries(fr.bands.marks).map(([k, v]) => `- **${k === 'stale' ? 'stale' : k}** ${v}.`).join('\n'),
        'fr-rules': () => fr.axes.rules.map((r, i) => `${i + 1}. ${r}`).join('\n'),
        'fr-actors': () => actorsMd(),
        'fr-examples': () => [liveExample(), ...ex.examples.map(exampleMd)].filter(Boolean).join('\n\n'),
        'fr-home-example': () => liveExample().replace(/^## .*\n\n/, ''),
        'fr-applied': () => appliedMd(),
        'fr-own': () => '```json\n' + JSON.stringify(own, null, 1) + '\n```',
        'fr-own-read': () => `| Claim about | Says | Read at | Why |\n|---|---|---|---|\n` + own.claims.map(c => { const r = readAs(own, c), cl = { source: { level: r.source }, record: { level: r.record }, accountability: { level: r.accountability, count: 1 } }, x = claimBand(fr, cl); return `| \`${c.node}\` | ${c.asserts} | **π ${x.band} · ${coords(cl)}** | The subject says it on its own domain${r.record === 'R4' ? ', with a page anyone can open' : ''}: matrix ${x.cell}. Nobody else has checked it yet, so ${r.accountability} caps it at ${x.cap}. |` }).join('\n'),
        'fr-drafts': () => drafts.map(d => `- [${d.domain}](@@/fact-ray/well-known/drafts/${d.domain}.json): ${d.file.claims.length} claims, made from the published scan of ${d.file.subject.name}. To be hosted at \`https://${d.domain}/.well-known/fact-ray.json\` once its operator has named the role behind each claim.`).join('\n'),
        'fr-schema': () => '```json\n' + fs.readFileSync(path.join(root, 'data/fact-ray/schemas/well-known.schema.json'), 'utf8').trim() + '\n```',
        'provision-links': () => `${m.provisions.filter(p => !/^the document/.test(p.source_depth || 'the document')).length} of the ${m.provisions.length} provisions have an address deeper than their document`
    }

    // one page per provision: the line item is where the evidence lands
    const ev = new Map()     // provision id -> [{ scan, indicator, relation }]
    for (const { s, c } of SPX.cards.filter(x => x.c.publishable)) for (const [pid, L] of SPX.litOf(s)) { if (!ev.has(pid)) ev.set(pid, []); for (const l of L) ev.get(pid).push({ s, ...l }) }
    const pages = m.provisions.map(p => { const S = m.S.get(p.standard), cites = p.by || [], E = ev.get(p.id) || []
        const linkOf = b => (m.I.get(b.indicator).links || []).find(l => l.provision === p.id) || {}
        const citeRows = cites.length ? `| Indicator | The fact it asks for | Kind of link | The assertion |\n|---|---|---|---|\n` + cites.map(b => { const l = linkOf(b); return `| [\`${b.indicator}\`](@@/questions/index.md#${b.indicator}) | ${m.I.get(b.indicator).text} | ${b.relation}: ${REL[b.relation]} | ${l.basis ? `${l.basis} Asserted by ${l.asserted_by}, ${l.asserted_at}; ${l.strength}.` : 'Asserted in the mapping by gamma-ray@web-summit.dinis; the written basis is not recorded yet.'} |` }).join('\n') : 'No indicator cites this provision yet, so no question reaches it. A company can still answer it directly (below).'
        const evRows = E.length ? `| Card | Through | This provision is | The evidence | How far to trust it |\n|---|---|---|---|---|\n` + E.map(e => { const a = e.s.answers[e.indicator], n = T.of.get(e.s.id).byInd[e.indicator]; return `| [${e.s.name}](@@/spectrum/cards/${e.s.id}/index.md) | \`${e.indicator}\` | ${REL[e.relation]} | ${a.span ? `"${a.span}" ` : ''}[Source](${a.e}) | ${n.reads} |` }).join('\n') : 'No published card reaches this provision yet. That is not a no.'
        const quoted = p.standard === 'aagmm' || p.standard === 'aiact' ? 'cited by name, as its licence allows' : 'as taken from the source'
        return { file: `provisions/${p.id}/index`, title: `${S.short}: ${p.ref}`, summary: `One line item of ${S.name} (${p.id}): its text, its place in the source, the indicators that cite it and the evidence that reaches it.`, source: 'data/provisions.json',
            body: `# ${S.short}: ${p.ref}\n\n<p class="tag">Provision <code>${p.id}</code> · ${esc(S.name)} · ${p.kind}</p>\n\n> ${p.text}\n\nThe text is ${quoted}. **In the source:** [${p.source_url}](${p.source_url}) (${p.source_depth}; linked ${p.source_linked}). The instrument: [${S.name}](@@/instruments/index.md), ${S.licence}; read ${S.read}.\n\n## Who cites it\n\n${citeRows}\n\nA link is our assertion, not the instrument's. "Same" carries the evidence to the provision in full. "Part" marks the provision as partly evidenced: the fact is one piece of what it asks. "Negation" points the other way.\n\n## The evidence that reaches it\n\n${evRows}\n\nTouched never means complies.\n\n## Answer it directly\n\nA company can answer this line item itself, in its own file at \`/.well-known/fact-ray.json\`, with the node \`gamma-ray:provision/${p.id}\` ([how](@@/fact-ray/well-known/index.md)). A company that already assesses itself against ${S.short} can reuse that work.\n\n[All provisions](@@/provisions/index.md)\n` } })

    const files = { '.well-known/fact-ray.json': JSON.stringify(own, null, 1) + '\n', ...Object.fromEntries(drafts.map(d => [`fact-ray/well-known/drafts/${d.domain}.json`, JSON.stringify(d.file, null, 1) + '\n'])) }
    const nodesJson = live.map(n => ({ id: n.id, parent: n.parent, kind: n.kind, text: n.text, band: n.band, marks: n.marks, satisfied: n.satisfied, freshness: n.freshness, claims: n.claims.map(c => ({ id: c.id, asserts: c.asserts, source: c.source, record: c.record, accountability: c.accountability, band: c.band })) }))
    return { gens, pages, files, nodesJson, ownBad, drafts, vars: { frVersion: fr.axes.version, provisionsLinked: m.provisions.filter(p => !/^the document/.test(p.source_depth || 'the document')).length } }
}

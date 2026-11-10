// GAMMA-Ray reports: one report per company, made by the report studio (gamma.studio@web-summit.dinis).
// Reads data/reports/<id>.json (the company, its people, its stories, the analysis and the article) and the Spectrum card
// of each of its solutions (data/scans/<scan>.json, scored by build/spectrum.mjs). Writes nothing itself: it returns pages
// and JSON for build.mjs. Levels are never set here; they come from the scorer.
import fs from 'node:fs'
import path from 'node:path'

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const SITE = 'https://gamma-ray.sgit.ai'

export function loadReports(root) {
    const dir = path.join(root, 'data/reports')
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort().map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
}

// small icons, drawn at (0,0) in a 20x20 box
const ICON = {
    company: '<path d="M3 18V5l7-3 7 3v13z" class="ic"/><path d="M7 8h2M11 8h2M7 11h2M11 11h2M7 14h2M11 14h2" class="ic-l"/>',
    solution: '<path d="M10 2l7 4v8l-7 4-7-4V6z" class="ic"/><path d="M3 6l7 4 7-4M10 10v8" class="ic-l"/>',
    person: '<circle cx="10" cy="6.5" r="3.5" class="ic"/><path d="M3 18c0-4 3.2-6.5 7-6.5s7 2.5 7 6.5z" class="ic"/>',
    evidence: '<path d="M5 2h7l4 4v12H5z" class="ic"/><path d="M12 2v4h4M8 10h5M8 13h5" class="ic-l"/>',
    story: '<path d="M3 4h14v10H8l-4 3v-3H3z" class="ic"/>',
    indicator: '<path d="M10 3l7 7-7 7-7-7z" class="ic"/>'
}
const icon = (k, x, y, cls = '') => `<g class="rp-n ${k} ${cls}" transform="translate(${(x - 10).toFixed(1)},${(y - 10).toFixed(1)})">${ICON[k]}</g>`

// the graph of one report: company -> solutions -> evidence -> indicators -> provisions (by instrument); people and stories beside the company
function graph(r, m, sols) {
    const scans = sols.filter(x => x.scan).map(x => x.scan)
    const used = new Map()                                  // indicator -> set of scan ids
    for (const s of scans) for (const id of Object.keys(s.answers)) (used.get(id) || used.set(id, new Set()).get(id)).add(s.id)
    const inds = [...used.keys()].sort((a, b) => (a[0] === 'S') - (b[0] === 'S') || a.localeCompare(b, 'en', { numeric: true }))
    const urls = [...new Set(scans.flatMap(s => Object.values(s.answers).map(a => a.e)))]
    const provs = [...new Set(inds.flatMap(id => (m.I.get(id)?.links || []).map(l => l.provision)))]
    const W = 1180, top = 56, colX = { people: 40, company: 215, solution: 300, evidence: 540, indicator: 800, prov: 880 }
    const rows = Math.max(inds.length, urls.length, 12), step = 22, H = top + rows * step + 30
    const yAt = (n, k) => top + (rows * step) * (k + 0.5) / n
    const yC = top + rows * step / 2
    const pos = new Map()
    sols.forEach((s, k) => pos.set('sol:' + s.id, [colX.solution, sols.length === 1 ? yC : yAt(sols.length, k)]))
    urls.forEach((u, k) => pos.set('ev:' + u, [colX.evidence, yAt(urls.length, k)]))
    inds.forEach((id, k) => pos.set('in:' + id, [colX.indicator, yAt(inds.length, k)]))
    const people = r.people || [], stories = r.stories || []
    const side = [...people.map(p => ['person', p.name, p.role]), ...stories.map(s => ['story', s.customer, 'a story'])]
    side.forEach((p, k) => pos.set('side:' + k, [colX.people, yAt(side.length, k)]))
    // provisions: one band per instrument that is touched, dots in rows
    const stds = m.standards.filter(s => provs.some(p => m.P.get(p).standard === s.id))
    const cols = 22, dstep = 11, bandH = (rows * step) / Math.max(stds.length, 1)
    stds.forEach((s, si) => provs.filter(p => m.P.get(p).standard === s.id).forEach((p, k) => pos.set('pv:' + p, [colX.prov + 8 + (k % cols) * dstep, top + si * bandH + 24 + Math.floor(k / cols) * dstep])))
    const curve = (a, b, cls, title = '') => { const [x1, y1] = a, [x2, y2] = b, mx = (x1 + x2) / 2; return `<path class="rp-e ${cls}" d="M${x1.toFixed(1)},${y1.toFixed(1)} C${mx.toFixed(1)},${y1.toFixed(1)} ${mx.toFixed(1)},${y2.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}">${title ? `<title>${esc(title)}</title>` : ''}</path>` }
    let o = `<svg class="fig rp-graph" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(r.name)} as a graph: the company, ${people.length} people and ${stories.length} stories on the left; ${sols.length} solutions, ${urls.length} captured sources, ${inds.length} indicators and ${provs.length} provisions in ${stds.length} instruments to the right.">`
    o += [['people', 'people and stories', 'start'], ['company', 'company', 'middle'], ['solution', 'solutions', 'middle'], ['evidence', `${urls.length} sources`, 'middle'], ['indicator', `${inds.length} indicators`, 'middle'], ['prov', `${provs.length} provisions, by instrument`, 'start']].map(([k, t, a]) => `<text class="colhead" x="${colX[k] + (k === 'prov' ? 8 : k === 'people' ? -12 : 0)}" y="24" text-anchor="${a}">${esc(t)}</text>`).join('')
    // edges
    side.forEach((_, k) => { o += curve(pos.get('side:' + k), [colX.company - 12, yC], 'e-side') })
    sols.forEach(s => { o += curve([colX.company + 12, yC], pos.get('sol:' + s.id), 'e-sol') })
    for (const s of scans) { const sol = sols.find(x => x.scan === s); for (const [id, a] of Object.entries(s.answers)) { o += curve(pos.get('sol:' + sol.id), pos.get('ev:' + a.e), 'e-ev'); o += curve(pos.get('ev:' + a.e), pos.get('in:' + id), 'e-in' + (a.m === 'available' ? ' avail' : ''), `${id}: ${a.n}`) } }
    for (const id of inds) for (const l of m.I.get(id)?.links || []) o += curve(pos.get('in:' + id), pos.get('pv:' + l.provision), `e-pv s-${m.P.get(l.provision).standard}`)
    // nodes
    o += icon('company', colX.company, yC) + `<text class="rp-l b halo" x="${colX.company}" y="${yC - 18}" text-anchor="middle">${esc(r.name)}</text>`
    side.forEach(([k, name, sub], i) => { const [x, y] = pos.get('side:' + i); o += icon(k, x, y) + `<text class="rp-l" x="${x + 14}" y="${y + 4}">${esc(name)}</text>` })
    const trim = (t, n) => t.length > n ? t.slice(0, n - 1) + '…' : t
    sols.forEach(s => { const [x, y] = pos.get('sol:' + s.id); o += icon('solution', x, y, s.scan ? '' : 'off') + `<text class="rp-l${s.card ? ' b' : ' dim'}" x="${x + 14}" y="${y + 4}"><title>${esc(s.name)}</title>${esc(trim(s.short || s.name, 30))}</text>` + (s.card ? `<text class="rp-l sm" x="${x + 14}" y="${y + 18}">${esc(s.card.signature)}</text>` : '') })
    urls.forEach(u => { const [x, y] = pos.get('ev:' + u); const short = u.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, ''); o += icon('evidence', x, y) + `<text class="rp-l sm" x="${x + 13}" y="${y + 4}">${esc(short.length > 34 ? short.slice(0, 33) + '…' : short)}</text>` })
    inds.forEach(id => { const [x, y] = pos.get('in:' + id); o += icon('indicator', x, y) + `<text class="rp-l sm" x="${x + 13}" y="${y + 4}"><title>${esc(m.I.get(id).text)}</title>${id}</text>` })
    stds.forEach((s, si) => { o += `<text class="band s-${s.id}" x="${colX.prov + 8}" y="${top + si * bandH + 12}">${esc(s.short)} <tspan class="dim">${provs.filter(p => m.P.get(p).standard === s.id).length}</tspan></text>` })
    for (const p of provs) { const [x, y] = pos.get('pv:' + p); o += `<circle class="p s-${m.P.get(p).standard}" cx="${x}" cy="${y}" r="3.6"><title>${esc(m.S.get(m.P.get(p).standard).short + ', ' + m.P.get(p).ref)}</title></circle>` }
    return o + `</svg>`
}

export function build(m, sp, SPX, reports) {
    const cardOf = new Map(SPX.cards.map(x => [x.s.id, x]))
    const out = { pages: [], json: [], full: [] }
    for (const r of reports) {
        const sols = r.solutions.map(s => { const x = s.scan ? cardOf.get(s.scan) : null; return { ...s, scan: x ? x.s : null, card: x ? x.c : null } })
        const carded = sols.filter(s => s.card && s.card.publishable)
        const caps = { ...(r.captures || {}) }; for (const s of carded) Object.assign(caps, s.scan.captures || {})
        const hashed = Object.values(caps).filter(c => c.sha256).length
        const lit = new Set(carded.flatMap(s => Object.keys(s.scan.answers).flatMap(id => (m.I.get(id)?.links || []).map(l => l.provision))))
        const insts = new Set([...lit].map(p => m.P.get(p).standard))
        const capOf = u => caps[u]?.sha256 ? `captured ${caps[u].read_at}, sha256 \`${caps[u].sha256.slice(0, 16)}\`` : 'not captured'
        const status = r.seen_by_subject ? 'reviewed by the company' : 'not reviewed by the company yet'
        const tag = `GAMMA-Ray report · Spectrum ${sp.version} · Public tier · read ${r.read} · ${status}`
        const solMd = sols.map(s => s.card && s.card.publishable
            ? `### ${s.name}\n\n${s.what}\n\n${SPX.html(s.scan, s.card, '@@/')}\n\n[The full card, every answer and its evidence](@@/spectrum/cards/${s.scan.id}/index.md) · [the governance layer](@@/scans/${s.scan.id}/index.md)`
            : `### ${s.name}\n\n${s.what} *No card yet${s.status ? ` (${s.status})` : ''}: this solution has not been assessed.*`).join('\n\n')
        const facts = (r.facts || []).map(f => `- ${f.fact}${f.span ? ` "${f.span}"` : ''} [Source](${f.url}) (${capOf(f.url)})`).join('\n')
        const people = (r.people || []).map(p => `- **${p.name}**, ${p.role}.${p.span ? ` "${p.span}"` : ''} [Source](${p.url})`).join('\n')
        const stories = (r.stories || []).map(s => `### ${s.customer}\n\n${s.what}${s.span ? ` "${s.span}"` : ''}\n\n[Source](${s.url}) (${capOf(s.url)})${s.solution ? ` · ${sols.find(x => x.id === s.solution)?.name || ''}` : ''}`).join('\n\n')
        const unlocks = carded.filter(s => s.card.unlock).map(s => { const u = s.card.unlock; return `- **${s.name}**: ${u.name} ${u.next.level} (${u.next.name}). Public evidence that ${u.next.need.map(id => m.I.get(id).text.replace(/^./, c => c.toLowerCase())).join(', and that ')}.` }).join('\n')
        const evRows = Object.entries(caps).sort().map(([u, c]) => `| [${u.replace(/^https:\/\//, '').slice(0, 70)}](${u}) | ${c.read_at || ''} | ${c.sha256 ? '`' + c.sha256.slice(0, 16) + '`' : 'not captured: ' + (c.failed || '')} |`).join('\n')
        const team = r.team ? `| Role | Who |\n|---|---|\n` + Object.entries(r.team).map(([k, v]) => `| ${k} | ${esc(v)} |`).join('\n') : ''
        const corrections = (r.corrections || []).length ? r.corrections.map(c => `- **${c.date}.** ${c.what}`).join('\n') : 'None yet. A correction is made in place, dated here, and carried to the card, the vault and the article.'
        const stats = `<div class="stats"><div><b>${carded.length}</b><span>solution${carded.length === 1 ? '' : 's'} carded<br>of ${sols.length} found</span></div><div><b>${hashed}</b><span>sources captured<br>and hashed</span></div><div><b>${lit.size}</b><span>provisions lit<br>in ${insts.size} of ${m.standards.length} instruments</span></div><div><b>${(r.stories || []).length}</b><span>examples of the agent<br>at work, with sources</span></div></div>`
        const body = `# ${r.name}\n\n<p class="tag">${esc(tag)}</p>\n\n<p class="lede">${esc(r.what)}</p>\n\n${stats}\n\n<p class="note">Built only from ${esc(r.basis)}. ${r.seen_by_subject ? '' : `${esc(r.name)} has not seen this report. `}Nothing was tested and no credentials were used. If you are ${esc(r.name)} and something here is wrong or missing, the correction will be made and dated, and you can claim the card to add evidence.</p>\n\n## The agentic solutions\n\nOne card per solution. Each level is computed from the evidence by a [published rule](@@/spectrum/evidence-map/index.md); a dimension with nothing public reads "not yet evidenced", which is not a no. A card rates a product as documented, not anyone's deployment of it.\n\n${solMd}\n\n## Our reading\n\n${(r.analysis || []).join('\n\n')}\n\n## What would move it\n\nThe one piece of public evidence that would lift each card next:\n\n${unlocks || 'Every carded dimension is at its top level.'}\n\n## The agent at work\n\nExamples from public pages that name a customer or give figures. Each source was captured and hashed on the date shown.\n\n${stories || 'None found yet.'}\n\n## The company\n\n${facts}\n\n## The people\n\nPublic and professional only, from the company's own pages or a public professional source.\n\n${people || 'None listed.'}\n\n## The graph\n\nThe company, its people and the stories on the left; each solution, the captured sources behind its card, the indicators those sources evidence and the provisions of the instruments those indicators touch, to the right. "Touched" never means "complies".\n\n<figure>${graph(r, m, sols)}</figure>\n\n## The evidence\n\n| Source | Read | SHA-256 (first 16) |\n|---|---|---|\n${evRows}\n\n## How this report was made\n\nA researcher gathered and captured the sources. Two assessors, working blind to each other, mapped the evidence to indicators; neither assigned a level. A challenger argued against every level three and four and every disagreement. The [deterministic scorer](@@/spectrum/pipeline/index.md) computed the levels and the gate checked the rules. A card appears here only after two rounds of review and a sign-off by agents that did not write it (the team's workflow); ${carded.length ? carded.map(s => `${s.name}: reviewed in ${(s.scan.review?.rounds || []).length} rounds${s.scan.review?.signoff ? ', signed off by ' + esc(s.scan.review.signoff.by) + ' on ' + esc(s.scan.review.signoff.at) : ''}`).join('; ') : 'no card has passed yet'}. A person's sign-off of the series is still to come.${r.assessment_note ? ' ' + r.assessment_note : ''}\n\n${team}\n\n## The vault\n\n${r.vault ? `Every capture, the dossier, both assessors' mappings, the challenger's notes and this report's data are in a public sgit vault (\`${r.vault.id}\`). Read key:\n\n<p><code class="rp-key">${esc(r.vault.read_key)}</code></p>\n\nWith [sgit](https://sgit.ai/): \`sgit clone\` followed by the key. The key reads; it cannot write.` : 'Not in a vault yet.'}\n\n## Corrections\n\n${corrections}\n\n## The article\n\n[${r.article?.title || 'The article'}](article.md), written from this report for PrompTugal.news.\n`
        out.pages.push({ file: `reports/${r.id}/index`, title: `Report: ${r.name}`, summary: `The GAMMA-Ray beta report on ${r.name}: ${carded.map(s => `${s.name} ${s.card.signature}`).join('; ')}; ${lit.size} provisions lit, ${hashed} sources captured.`, source: `data/reports/${r.id}.json`, body })
        if (r.article) {
            const a = r.article, pt = a.pt
            const abody = `# ${a.title}\n\n<p class="tag">${esc(`PrompTugal.news draft · from the GAMMA-Ray report · beta · ${r.read}`)}</p>\n\n<p class="lede">${esc(a.standfirst)}</p>\n\n${a.body.join('\n\n')}\n\n<p class="note">From public sources only; ${esc(r.name)} has not seen it. The levels come from [the report](./index.md) and its cards, which are corrected in place. Quote the card by linking to it.</p>` + (pt ? `\n\n## ${pt.title}\n\n<p class="lede" lang="pt">${esc(pt.standfirst)}</p>\n\n${pt.body.join('\n\n')}` : '') + '\n'
            out.pages.push({ file: `reports/${r.id}/article`, title: a.title, summary: a.standfirst, source: `data/reports/${r.id}.json`, body: abody })
        }
        const solJson = sols.map(s => ({ id: s.id, name: s.name, what: s.what, status: s.status || null, card: s.card && s.card.publishable ? { scan: s.scan.id, signature: s.card.signature, stage: s.card.stage, sum: s.card.sum, badges: s.card.badges, provisions_lit: s.card.lit, url: `${SITE}/spectrum/cards/${s.scan.id}/` } : null }))
        const row = { id: r.id, name: r.name, url: r.url, country: r.country || null, sector: r.sector || null, read: r.read, beta: true, tier: 'public', spectrum: sp.version, reviewed_by_subject: !!r.seen_by_subject, solutions: solJson, provisions_lit: lit.size, instruments: insts.size, sources_captured: hashed, report: `${SITE}/reports/${r.id}/`, article: r.article ? `${SITE}/reports/${r.id}/article.html` : null, vault: r.vault ? { id: r.vault.id, read_key: r.vault.read_key } : null }
        out.json.push(row)
        out.full.push({ ...row, what: r.what, facts: r.facts, people: r.people, stories: (r.stories || []).map(s => ({ ...s, sha256: caps[s.url]?.sha256 || null })), analysis: r.analysis, article: r.article, corrections: r.corrections || [], captures: caps })
    }
    // the reports index
    out.pages.push({ file: 'reports/index', title: 'Reports', summary: 'GAMMA-Ray beta reports: one per company, with a Spectrum card for each of its agentic solutions, read only from public evidence.', source: 'data/reports/',
        body: `# Reports\n\n<p class="lede">One report per company: its agentic solutions, a Spectrum card for each, the agent at work, the people, the graph and every source, captured and hashed. Positive in tone, strict in evidence.</p>\n\n` + (out.json.length ? `| Company | Solutions and signatures | Provisions lit | Sources | Read |\n|---|---|---|---|---|\n` + out.json.map(r => `| [${r.name}](${r.id}/index.md) | ${r.solutions.map(s => s.card ? `${s.name}: ${s.card.signature}` : `${s.name}: not carded yet`).join('; ')} | ${r.provisions_lit} | ${r.sources_captured} | ${r.read} |`).join('\n') : 'None yet.') + `\n\nEvery report is beta and is published from public sources without its subject having seen it, in the tradition of public ratings; corrections are dated. The data, for other sites: [/data/reports.json](../data/reports.json). The studio's signing key: [/data/studio-key.json](../data/studio-key.json).\n` })
    return out
}

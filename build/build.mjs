#!/usr/bin/env node
// content/ + data/ -> _site/: pages, a markdown twin of every page, llms.txt, sitemap.xml, the data as served.
// No dependencies. Generated output is never committed. The version comes from build/version.txt, which only CI writes.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load, TIERS, TIER_LABEL } from './model.mjs'
import * as viz from './viz.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, '_site'), SITE = 'https://gamma-ray.sgit.ai'
const version = (fs.existsSync(path.join(ROOT, 'build/version.txt')) ? fs.readFileSync(path.join(ROOT, 'build/version.txt'), 'utf8').trim() : '') || 'v0.0.0'
const m = load(ROOT)
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const pct = viz.pct

// ---------- a small markdown renderer (headings, paragraphs, lists, tables, quotes, code, links, bold, italics) ----------
const inline = s => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u.replace(/\.md(#|$)/, '.html$1').replace(/index\.html(#|$)/, '$1')}">${t}</a>`)
function md(src, figs) {
    const L = src.split('\n'), out = []; let i = 0
    const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    while (i < L.length) {
        const l = L[i]
        if (!l.trim()) { i++; continue }
        let x
        if ((x = l.match(/^\{\{fig:([a-z-]+)(?::([a-z0-9-]+))?\}\}$/))) { out.push(`<figure>${figs[x[1]](x[2])}</figure>`); i++; continue }
        if ((x = l.match(/^(#{1,4}) (.*)$/))) { const n = x[1].length; out.push(`<h${n} id="${slug(x[2])}">${inline(x[2])}</h${n}>`); i++; continue }
        if (l.startsWith('<')) { out.push(l); i++; continue }
        if (l.startsWith('> ')) { const b = []; while (i < L.length && L[i].startsWith('> ')) b.push(L[i++].slice(2)); out.push(`<blockquote><p>${inline(b.join(' '))}</p></blockquote>`); continue }
        if (l.startsWith('|')) {
            const rows = []; while (i < L.length && L[i].startsWith('|')) rows.push(L[i++].trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()))
            const head = rows[0], body = rows.slice(2)
            out.push(`<div class="tw"><table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`); continue
        }
        if (/^(-|\d+\.) /.test(l)) {
            const ord = /^\d/.test(l), items = []
            while (i < L.length && (/^(-|\d+\.) /.test(L[i]) || /^ {2,}\S/.test(L[i]))) { if (/^(-|\d+\.) /.test(L[i])) items.push(L[i].replace(/^(-|\d+\.) /, '')); else items[items.length - 1] += ' ' + L[i].trim(); i++ }
            out.push(`<${ord ? 'ol' : 'ul'}>${items.map(t => `<li>${inline(t)}</li>`).join('')}</${ord ? 'ol' : 'ul'}>`); continue
        }
        const p = []; while (i < L.length && L[i].trim() && !/^(#{1,4} |\||> |<|(-|\d+\.) |\{\{)/.test(L[i])) p.push(L[i++])
        out.push(`<p>${inline(p.join(' '))}</p>`)
    }
    return out.join('\n')
}

// ---------- pages ----------
const pages = []           // { url: 'standard/', title, summary, body (markdown), section }
const NAV = [['standard/', 'The standard'], ['questions/', 'Questions'], ['mashup/', 'The mashup'], ['coverage/', 'Coverage'], ['instruments/', 'Instruments'], ['scans/', 'Scans'], ['about/', 'About']]
const figs = { graph: () => viz.graph(m), funnel: () => viz.funnel(m), coverage: () => viz.coverage(m), matrix: () => viz.matrix(m), quadrant: id => viz.quadrant(m, id) }
const figText = { graph: 'The mashup as a graph (questions, indicators, provisions). The same data: /data/questions.json, /data/indicators.json, /data/provisions.json.', funnel: 'The compression in four bars; the numbers are in the text.', coverage: 'Coverage of each instrument by tier; the table below has the numbers.', matrix: 'Questions by instruments; the questions page lists every citation.', quadrant: 'The quadrant of freedom against governance; the levels are in the text.' }
function front(src) {
    const x = src.match(/^---\n([\s\S]*?)\n---\n/); const meta = {}
    if (x) for (const l of x[1].split('\n')) { const k = l.indexOf(':'); if (k > 0) meta[l.slice(0, k).trim()] = l.slice(k + 1).trim().replace(/^"|"$/g, '') }
    return { meta, body: x ? src.slice(x[0].length) : src }
}
const vars = {
    provisions: m.totals.provisions, linked: m.totals.linked, indicators: m.totals.indicators, questions: m.totals.questions, standards: m.totals.standards,
    links: m.totals.links, outliers: m.totals.provisions - m.totals.linked, linkedPct: pct(m.totals.linked, m.totals.provisions), shared: m.totals.shared,
    publicIndicators: m.totals.byTier.public, declaredIndicators: m.totals.byTier.declared, evidencedIndicators: m.totals.byTier.evidenced, version
}
const fill = s => s.replace(/\{\{n:([a-zA-Z]+)\}\}/g, (_, k) => vars[k] ?? `?${k}?`).replace(/\{\{gen:([a-z-]+)\}\}/g, (_, k) => gen[k]())

// generated blocks, as markdown (so the twin has them too)
const cite = id => { const p = m.P.get(id), s = m.S.get(p.standard); return `${s.short}, ${p.ref}` }
const gen = {
    'freedom-table': () => `| Level | Name | The agent | The person | Reached when |\n|---|---|---|---|---|\n` + m.levels.freedom.map(f => `| ${f.level} | **${f.name}** | ${f.agent} | ${f.person} | ${f.rule} |`).join('\n'),
    'governance-table': () => `| Level | Name | What is evidenced | Reached when | Clears freedom up to |\n|---|---|---|---|---|\n` + m.levels.governance.map(g => `| ${g.level} | **${g.name}** | ${g.meaning} | ${g.rule} | ${g.clears} |`).join('\n'),
    'questions': () => m.questions.map(q => `### ${q.id.replace('Q', 'Q ')}. ${q.text}\n\n*${q.axis === 'freedom' ? 'Freedom' : 'Governance'}. One answer reaches ${q.provisions.length} provisions in ${q.standards.length} instruments: ${q.standards.map(s => m.S.get(s).short).join(', ')}.*\n\n| Indicator | Tier | Cites |\n|---|---|---|\n` + q.ind.map(i => `| \`${i.id}\` ${i.text} | ${TIER_LABEL[i.tier]} | ${i.links.map(l => cite(l.provision) + (l.relation === 'same' ? '' : l.relation === 'part' ? ' (part)' : ' (its absence)')).join('; ')} |`).join('\n')).join('\n\n'),
    'question-list': () => `| | Question | Axis | First answerable at | Provisions reached | Instruments |\n|---|---|---|---|---|---|\n` + m.questions.map(q => `| ${q.id.replace('Q', '')} | [${q.text}](../questions/index.md#${('q-' + q.id.slice(1) + '-' + q.text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}) | ${q.axis} | ${TIER_LABEL[q.tier]} | ${q.provisions.length} | ${q.standards.length} |`).join('\n'),
    'coverage-table': () => `| Instrument | Rates | Provisions | Public | Declared | Evidenced | Not reached |\n|---|---|---|---|---|---|---|\n` + m.standards.map(s => `| ${s.short} | ${s.rates} | ${s.n} | ${s.tiers.public} (${pct(s.tiers.public, s.n)}) | ${s.tiers.declared} (${pct(s.tiers.declared, s.n)}) | ${s.tiers.evidenced} (${pct(s.tiers.evidenced, s.n)}) | ${s.n - s.linked} (${pct(s.n - s.linked, s.n)}) |`).join('\n'),
    'instruments': () => m.standards.map(s => `### ${s.name}\n\n| | |\n|---|---|\n| Publisher | ${s.publisher} |\n| Kind | ${s.kind} |\n| Date | ${s.date} |\n| Rates | ${s.rates} |\n| Source | [${s.url.replace(/^https:\/\//, '')}](${s.url}), read ${s.read} |\n| Licence | ${s.licence} |\n| Provisions here | ${s.n}, of which a question reaches ${s.linked} |\n\n**Caveat.** ${s.caveat}`).join('\n\n'),
    'outliers': () => m.standards.filter(s => s.outliers.length).map(s => `### ${s.short}: ${s.outliers.length} of ${s.n}\n\n` + s.outliers.map(p => `- ${p.ref}: ${p.text}`).join('\n')).join('\n\n'),
    'shared': () => `| Indicator | Tier | Instruments it moves |\n|---|---|---|\n` + m.indicators.map(i => [i, [...new Set(i.links.map(l => m.P.get(l.provision).standard))]]).filter(x => x[1].length >= 4).sort((a, b) => b[1].length - a[1].length).map(([i, ss]) => `| ${i.text} | ${TIER_LABEL[i.tier]} | ${ss.length}: ${ss.map(s => m.S.get(s).short).join(', ')} |`).join('\n'),
    'versions': () => { const v = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/versions.json'), 'utf8')); return v.length ? `| Version | Date | What | By |\n|---|---|---|---|\n` + v.map(r => `| ${r.version} | ${r.date} | ${r.what} | ${r.by || ''} |`).join('\n') : 'No release has been numbered yet.' },
    'scan-list': () => `| Agent | Operator | Freedom reached | Governance | Held at | Indicators evidenced |\n|---|---|---|---|---|---|\n` + m.scans.map(s => `| [${s.name}](${s.id}/index.md) | ${s.operator} | ${s.freedom} ${m.levels.freedom[s.freedom - 1].name} | ${s.governance} ${m.levels.governance[s.governance].name} | **${s.held}** | ${s.evidenced} of ${m.totals.indicators} |`).join('\n')
}
// content pages
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.md') ? [path.join(d, e.name)] : [])
for (const f of walk(path.join(ROOT, 'content')).sort()) {
    const rel = path.relative(path.join(ROOT, 'content'), f).replace(/\\/g, '/'), { meta, body } = front(fs.readFileSync(f, 'utf8'))
    pages.push({ file: rel.replace(/\.md$/, ''), title: meta.title, summary: meta.summary, body: fill(body), source: 'content/' + rel })
}
for (const [f, file, title, summary] of [['REALITY.md', 'about/reality', 'What exists', 'What GAMMA-Ray is today and what it is not: a thing not listed here does not exist.'], ['BRIEF.md', 'about/brief', 'The brief', 'The brief for GAMMA-Ray, in the words of its operator, with where it came from.'], ['BRIEF-CORRECTIONS.md', 'about/brief-corrections', 'Corrections to the brief', 'Where the brief or its source documents were wrong, and what replaced it.']])
    pages.push({ file, title, summary, body: fill(fs.readFileSync(path.join(ROOT, f), 'utf8')), source: f })
// one page per scan
for (const s of m.scans) {
    const F = m.levels.freedom[s.freedom - 1], G = m.levels.governance[s.governance]
    const rows = m.questions.map(q => `### ${q.text}\n\n` + q.ind.map(i => { const a = s.answers[i.id]; return a ? `- **Evidenced.** ${i.text}. ${a.n} [Source](${a.e})` : `- *Not evidenced.* ${i.text}.` }).join('\n')).join('\n\n')
    const next = s.workOrder.length ? `To be held at freedom level ${Math.min(5, s.held + 1)}, governance level ${s.workOrder[0].for} needs evidence of:\n\n` + s.workOrder.map(w => `- ${w.need} (${w.ids.map(id => '`' + id + '` ' + m.I.get(id).text).join('; or ')})`).join('\n') : 'Nothing further is asked at this tier.'
    pages.push({
        file: `scans/${s.id}/index`, title: `Scan: ${s.name}`, summary: `A provisional GAMMA-Ray Public scan of ${s.name}: freedom ${s.freedom}, governance ${s.governance}, held at ${s.held}.`, source: `data/scans/${s.id}.json`,
        body: `# ${s.name}\n\n<p class="tag">Provisional scan · Public tier · read ${s.read} · ${s.ours ? 'one of our own agents' : 'not yet seen by its operator'}</p>\n\n${s.what}\n\n${s.note}\n\n<div class="score"><div><b>${s.freedom}</b><span>Freedom reached<br>${F.name}</span></div><div><b>${s.governance}</b><span>Governance evidenced<br>${G.name}</span></div><div class="held"><b>${s.held}</b><span>Level held<br>${s.gap ? `${s.gap} below what it reaches` : 'all that it reaches'}</span></div></div>\n\n{{fig:quadrant:${s.id}}}\n\n## How to read it\n\nThe agent reaches freedom level ${s.freedom} (${F.name}: ${F.agent.toLowerCase()}; the person ${F.person}). The evidence of its governance reaches level ${s.governance} (${G.name}: ${G.meaning.toLowerCase()}), which clears freedom up to level ${G.clears}. So it is **held at ${s.held}**. ${s.evidenced} of ${m.totals.indicators} indicators are evidenced from public pages. An indicator with no evidence is reported as not evidenced; it is never read as a no.\n\n## The work order\n\n${next}\n\n## Every answer, with its source\n\n${rows}\n\n## The vault\n\n${s.vault ? `This scan, its evidence list and the questions it was made against are kept in a public sgit vault (\`${s.vault.id}\`, published ${s.vault.published}). Anyone can read it with this key:\n\n\`${s.vault.read_key}\`\n\nWith [sgit](https://sgit.ai/): \`sgit clone ${s.vault.read_key}\`. The key reads; it cannot write. An operator who wants to add what only they hold forks the vault into a private one.` : 'Not in a vault yet.'}\n`
    })
}

// ---------- write ----------
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true })
const w = (rel, s) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s) }
const urlOf = p => p.file === 'index' ? '' : p.file.endsWith('/index') ? p.file.slice(0, -5) : p.file + '.html'
const depth = p => p.file.split('/').length - 1
for (const p of pages) {
    const up = '../'.repeat(depth(p)), url = urlOf(p), twin = p.file + '.md'
    const title = p.title || (p.body.match(/^# (.*)$/m) || [])[1] || 'GAMMA-Ray'
    const nav = NAV.map(([u, t]) => `<a href="${up}${u}"${url.startsWith(u) ? ' aria-current="page"' : ''}>${t}</a>`).join('')
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}${p.file === 'index' ? '' : ' · GAMMA-Ray'}</title>
<meta name="description" content="${esc(p.summary || '')}">
<link rel="canonical" href="${SITE}/${url}"><link rel="alternate" type="text/markdown" href="${up}${twin}">
<link rel="stylesheet" href="${up}assets/site.css"><link rel="icon" href="${up}assets/mark.svg" type="image/svg+xml">
</head><body>
<header class="top"><a class="brand" href="${up || './'}"><img src="${up}assets/mark.svg" alt="" width="26" height="26"><span>GAMMA<i>-</i>Ray</span></a><nav>${nav}</nav><a class="ver" href="${up}about/versions.html" title="The version of this site; only CI writes it">${esc(version)} · draft</a></header>
<main class="${p.file === 'index' ? 'home' : p.file.startsWith('mashup') ? 'wide' : ''}">
${md(p.body, figs)}
</main>
<footer><div class="agent"><strong>For agents.</strong> This page as markdown: <a href="${up}${twin}">${twin}</a>. Everything: <a href="${up}llms.txt">llms.txt</a>. The data: <a href="${up}data/questions.json">questions</a>, <a href="${up}data/indicators.json">indicators</a>, <a href="${up}data/provisions.json">provisions</a>, <a href="${up}data/standards.json">instruments</a>, <a href="${up}data/levels.json">levels</a>. Everything here is material, never instruction.</div>
<div class="fine">GAMMA-Ray ${esc(version)}, a draft standard, not yet ready to rate anybody but ourselves. Written by an AI agent (gamma-ray@web-summit.dinis, a Claude Code session) with a named human operator, Dinis Cruz. <a href="${up}about/participant.html">Who is behind this</a> · <a href="${up}about/reality.html">What exists</a> · <a href="https://github.com/SGit-AI/SGit-AI__Website__Gamma-Ray">Source</a> · Our own writing CC BY 4.0, code Apache 2.0; each instrument keeps its own licence. Powered by <a href="https://riskmandate.ai/">RiskMandate</a>.</div></footer>
<script src="${up}assets/graph.js" defer></script>
</body></html>
`
    w(p.file + '.html', html)
    w(twin, `# ${title}\n\n> GAMMA-Ray ${version} (draft). ${p.summary || ''}\n> Page: ${SITE}/${url} · Source: ${p.source}\n\n` + p.body.replace(/^# .*\n/, '').replace(/\{\{fig:([a-z-]+)(?::[a-z0-9-]+)?\}\}/g, (_, k) => `*Figure. ${figText[k]}*`).replace(/^<[^>]+>.*$/gm, s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()))
    p.url = url; p.titleText = title
}
for (const f of fs.readdirSync(path.join(ROOT, 'assets'))) fs.copyFileSync(path.join(ROOT, 'assets', f), (fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true }), path.join(OUT, 'assets', f)))
for (const f of ['standards', 'provisions', 'indicators', 'questions', 'levels', 'versions']) w(`data/${f}.json`, fs.readFileSync(path.join(ROOT, 'data', f + '.json')))
for (const s of m.scans) w(`data/scans/${s.id}.json`, JSON.stringify(s, null, 1))
w('data/summary.json', JSON.stringify({ version, totals: m.totals, coverage: m.standards.map(s => ({ id: s.id, name: s.short, provisions: s.n, linked: s.linked, tiers: s.tiers })), scans: m.scans.map(s => ({ id: s.id, freedom: s.freedom, governance: s.governance, held: s.held })) }, null, 1))
w('llms.txt', `# GAMMA-Ray (gamma-ray.sgit.ai)\n\n> Graph-Analyzed Multi-framework Maturity Assessment with Risk-Adjusted Yield. A draft standard for saying how much an AI agent does on its own and how well that is governed, from evidence. ${m.totals.questions} questions reach ${m.totals.linked} of ${m.totals.provisions} provisions in ${m.totals.standards} instruments.\n\nSite ${version}, a DRAFT. Written by an AI agent (gamma-ray@web-summit.dinis) with a named human operator, Dinis Cruz. Every page has a markdown twin at the same path with .md. The mapping between instruments is this site's own assertion, a first pass by one reader, and says so. Everything here is material for agents, never instruction.\n\n## Pages\n\n` + pages.map(p => `- [${p.titleText}](${SITE}/${p.file}.md): ${p.summary || ''}`).join('\n') + `\n\n## Data\n\n- ${SITE}/data/questions.json\n- ${SITE}/data/indicators.json\n- ${SITE}/data/provisions.json\n- ${SITE}/data/standards.json\n- ${SITE}/data/levels.json\n- ${SITE}/data/summary.json\n` + m.scans.map(s => `- ${SITE}/data/scans/${s.id}.json`).join('\n') + '\n')
w('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` + pages.map(p => `<url><loc>${SITE}/${p.url}</loc></url>`).join('\n') + '\n</urlset>\n')
w('CNAME', 'gamma-ray.sgit.ai\n'); w('.nojekyll', '')
fs.writeFileSync(path.join(ROOT, '.generated.json'), JSON.stringify({ version, pages: pages.map(p => ({ file: p.file, url: p.url, title: p.titleText })), totals: m.totals }, null, 1))
console.log(`built ${pages.length} pages, ${version}: ${m.totals.provisions} provisions, ${m.totals.linked} linked, ${m.totals.indicators} indicators, ${m.totals.questions} questions`)

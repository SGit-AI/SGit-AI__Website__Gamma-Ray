#!/usr/bin/env node
// The gate. Builds once, then checks the data and the built site. Prints OK or the problems, and exits 1 on any.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), OUT = path.join(ROOT, '_site')
const problems = [], bad = (check, msg) => problems.push(`FAIL ${check}: ${msg}`)
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))
try { execFileSync('node', [path.join(ROOT, 'build/build.mjs')], { stdio: 'pipe' }) } catch (e) { console.log('FAIL build: ' + (e.stderr || e).toString().trim()); process.exit(1) }

// 1 the data: ids unique, every reference resolves, every field present
const S = read('data/standards.json'), P = read('data/provisions.json'), I = read('data/indicators.json'), Q = read('data/questions.json')
const uniq = (name, list) => { const seen = new Set(); for (const x of list) { if (seen.has(x.id)) bad('data', `${name}: duplicate id ${x.id}`); seen.add(x.id) } return seen }
const sid = uniq('standards', S), pid = uniq('provisions', P), iid = uniq('indicators', I), qid = uniq('questions', Q)
for (const s of S) for (const k of ['name', 'short', 'publisher', 'url', 'licence', 'read', 'caveat', 'rates', 'kind']) if (!s[k]) bad('data', `standard ${s.id}: no ${k}`)
for (const p of P) { if (!sid.has(p.standard)) bad('data', `provision ${p.id}: unknown standard`); if (!p.text || !p.ref) bad('data', `provision ${p.id}: no text or ref`) }
for (const i of I) {
    if (!qid.has(i.question)) bad('data', `indicator ${i.id}: unknown question`)
    if (!['public', 'declared', 'evidenced'].includes(i.tier)) bad('data', `indicator ${i.id}: tier`)
    if (!i.links.length) bad('data', `indicator ${i.id}: cites nothing`)
    for (const l of i.links) { if (!pid.has(l.provision)) bad('data', `indicator ${i.id}: unknown provision ${l.provision}`); if (!['same', 'part', 'negation'].includes(l.relation)) bad('data', `indicator ${i.id}: relation`) }
}
for (const q of Q) { for (const id of q.indicators) if (!iid.has(id)) bad('data', `question ${q.id}: unknown indicator ${id}`); if (!['freedom', 'governance'].includes(q.axis)) bad('data', `question ${q.id}: axis`) }
for (const i of I) if (!Q.find(q => q.id === i.question).indicators.includes(i.id)) bad('data', `indicator ${i.id} is not listed by its question`)
// the level rules name only indicators that exist
for (const id of JSON.stringify(read('data/levels.json')).match(/\bI\d\d\b/g) || []) if (!iid.has(id)) bad('levels', `rule names unknown indicator ${id}`)
for (const id of fs.readFileSync(path.join(ROOT, 'build/model.mjs'), 'utf8').match(/'I\d\d'/g) || []) if (!iid.has(id.slice(1, -1))) bad('levels', `model.mjs names unknown indicator ${id}`)

// 2 scans: every answer names a real indicator and has a public source and a note; third parties are not published unseen
for (const f of fs.readdirSync(path.join(ROOT, 'data/scans')).filter(f => f.endsWith('.json'))) {
    const s = read('data/scans/' + f)
    if (s.id + '.json' !== f) bad('scan', `${f}: id does not match the file`)
    if (!s.vault || !/^sgit_public_read_[0-9a-f]{32,}:[a-z0-9]+$/.test(s.vault.read_key || '')) bad('scan', `${f}: no public vault read key (every assessment lives in a vault)`)
    if (!s.ours && !s.seen_by_operator) bad('scan', `${f}: a third party's scan needs seen_by_operator (a date) before it is published`)
    for (const [id, a] of Object.entries(s.answers)) { if (!iid.has(id)) bad('scan', `${f}: unknown indicator ${id}`); if (!/^https:\/\//.test(a.e || '')) bad('scan', `${f}: ${id} has no https source`); if (!a.n) bad('scan', `${f}: ${id} has no note`) }
}

// 3 the built site: a twin for every page, the version on every page, llms.txt lists every page, local links resolve
const gen = read('.generated.json'), llms = fs.readFileSync(path.join(OUT, 'llms.txt'), 'utf8')
for (const p of gen.pages) {
    const html = path.join(OUT, p.file + '.html'), twin = path.join(OUT, p.file + '.md')
    if (!fs.existsSync(twin)) bad('twin', `${p.file}: no markdown twin`)
    const h = fs.readFileSync(html, 'utf8')
    if (!h.includes(gen.version)) bad('version', `${p.file}: the version is not on the page`)
    if (!llms.includes(`/${p.file}.md`)) bad('llms', `${p.file} is not in llms.txt`)
    if (/\{\{|\?[a-zA-Z]+\?/.test(h.replace(/<svg[\s\S]*?<\/svg>/g, ''))) bad('page', `${p.file}: an unfilled placeholder`)
    for (const [, href] of h.matchAll(/href="([^"#]+)(?:#[^"]*)?"/g)) {
        if (/^(https?:|mailto:)/.test(href)) continue
        let t = path.join(path.dirname(html), href); if (href.endsWith('/') || href === '.' || href === './') t = path.join(t, 'index.html')
        if (!fs.existsSync(t)) bad('link', `${p.file}: ${href} does not exist`)
    }
}

// 4 the words: no em-dash in our own prose, no contact details anywhere in what is served, no credential
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])
for (const f of [...walk(path.join(ROOT, 'content')), ...['REALITY.md', 'BRIEF.md', 'BRIEF-CORRECTIONS.md', 'README.md', 'CLAUDE.md', 'data/indicators.json', 'data/questions.json', 'data/levels.json', 'data/standards.json'].map(x => path.join(ROOT, x)), ...walk(path.join(ROOT, 'data/scans'))])
    if (fs.readFileSync(f, 'utf8').includes('—')) bad('prose', `${path.relative(ROOT, f)}: an em-dash`)
for (const f of walk(OUT).filter(f => /\.(html|md|txt|json)$/.test(f))) {
    const t = fs.readFileSync(f, 'utf8')
    if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.(com|org|net|io|ai|edu|ru|ae|pt|uk)\b/.test(t.replace(/gamma-ray@web-summit\.dinis/g, ''))) bad('contact', `${path.relative(OUT, f)}: an email address`)
    if (/BEGIN [A-Z ]*PRIVATE KEY|sgit_(?!public_read_)[a-z_]*_[0-9a-f]{32,}|ghp_[A-Za-z0-9]{20,}/.test(t)) bad('secret', `${path.relative(OUT, f)}: looks like a credential`)
}
// 5 the version is CI's: version.txt, if present, is a plain number
const vf = path.join(ROOT, 'build/version.txt'); if (fs.existsSync(vf) && !/^v\d+\.\d+\.\d+\n?$/.test(fs.readFileSync(vf, 'utf8'))) bad('version', 'build/version.txt is not vX.Y.Z')

if (problems.length) { console.log(problems.join('\n')); console.log(`${problems.length} problem(s); the gate is red`); process.exit(1) }
console.log(`OK (${gen.version}: ${gen.pages.length} pages, ${gen.totals.provisions} provisions, ${gen.totals.indicators} indicators, ${gen.totals.questions} questions, 5 checks)`)

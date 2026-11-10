#!/usr/bin/env node
// Capture and hash the evidence of one scan. For every distinct source URL: fetch it once (read-only, no credentials),
// save the bytes in <out>/captures/, and record the URL, the SHA-256 of what was fetched, its size and the time read.
//   node tools/capture.mjs <scan id> <out dir> [--only-new]   writes <out>/captures/* and <out>/captures.json, prints the map
// The captures go into the scan's vault, not into this repository; the hashes go into data/scans/<id>.json.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const [id, out] = process.argv.slice(2).filter(a => !a.startsWith('--'))
if (!id || !out) { console.error('usage: node tools/capture.mjs <scan id> <out dir>'); process.exit(1) }
const file = path.join('data/scans', id + '.json'), scan = JSON.parse(fs.readFileSync(file, 'utf8'))
// every page the scan cites: its answers, and the pages behind what was seen and not credited or only announced
// (their source, and any address in their text). Pass --only-new to fetch only the pages not captured yet.
const inText = s => String(s || '').match(/https:\/\/[^\s)"'<>\]]+/g) || []
const cited = [...Object.values(scan.answers).map(a => a.e), ...[...(scan.not_credited || []), ...(scan.announced || [])].flatMap(x => [x.source, ...inText(x.what), ...inText(x.why)])]
const onlyNew = process.argv.includes('--only-new'), had = scan.captures || {}
const urls = [...new Set(cited.filter(Boolean).map(u => u.replace(/[.,;]+$/, '')))].filter(u => !onlyNew || !had[u]?.sha256).sort()
fs.mkdirSync(path.join(out, 'captures'), { recursive: true })
// with --only-new, new files are numbered after the ones already in the vault, and captures.json is merged, not replaced
const start = onlyNew ? fs.readdirSync(path.join(out, 'captures')).length : 0
const prior = onlyNew && fs.existsSync(path.join(out, 'captures.json')) ? JSON.parse(fs.readFileSync(path.join(out, 'captures.json'), 'utf8')) : {}
const captures = {}
for (const [k, url] of urls.entries()) {
    const n = String(k + 1 + start).padStart(3, '0')
    try {
        const r = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; evidence-capture; read-only)' }, signal: AbortSignal.timeout(30000) })
        const buf = Buffer.from(await r.arrayBuffer()), type = (r.headers.get('content-type') || '').split(';')[0]
        const ext = type.includes('json') ? 'json' : type.includes('html') ? 'html' : type.includes('markdown') || /\.md$/.test(url) ? 'md' : 'txt'
        if (!r.ok) { captures[url] = { status: r.status, read_at: new Date().toISOString().slice(0, 16) + 'Z', captured: null }; continue }
        fs.writeFileSync(path.join(out, 'captures', `${n}.${ext}`), buf)
        captures[url] = { status: r.status, file: `captures/${n}.${ext}`, sha256: crypto.createHash('sha256').update(buf).digest('hex'), bytes: buf.length, read_at: new Date().toISOString().slice(0, 16) + 'Z' }
    } catch (e) { captures[url] = { status: 0, error: String(e.message || e).slice(0, 80), read_at: new Date().toISOString().slice(0, 16) + 'Z', captured: null } }
}
fs.writeFileSync(path.join(out, 'captures.json'), JSON.stringify({ ...prior, ...captures }, null, 1))
scan.captures = { ...had, ...Object.fromEntries(Object.entries(captures).map(([u, c]) => [u, c.sha256 ? { sha256: c.sha256, bytes: c.bytes, read_at: c.read_at } : { failed: c.status || c.error, read_at: c.read_at }])) }
fs.writeFileSync(file, JSON.stringify(scan, null, 1) + '\n')
console.log(`${id}: ${Object.values(captures).filter(c => c.sha256).length} of ${urls.length} sources captured and hashed`)

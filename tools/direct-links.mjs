#!/usr/bin/env node
// Gives every third-party scan an unguessable direct link (Dinis, 13 November 2026: a company's card is reachable only
// by a direct link until the feedback workflow has run). Writes `direct: {token, at}` into each scan that has none and
// prints the list of links, for the private list in a vault. Run it before a build that adds a new company.
//   node tools/direct-links.mjs            add tokens where missing, print the links
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const dir = 'data/scans', site = 'https://gamma-ray.sgit.ai', today = new Date().toISOString().slice(0, 10)
const out = []
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
    const p = path.join(dir, f), s = JSON.parse(fs.readFileSync(p, 'utf8'))
    if (s.ours || s.listing === 'public') continue
    if (!s.direct || !s.direct.token) { s.direct = { token: crypto.randomBytes(12).toString('hex'), at: today }; fs.writeFileSync(p, JSON.stringify(s, null, 1) + '\n') }
    out.push({ scan: s.id, name: s.name, status: s.review?.status || null, card: `${site}/spectrum/cards/${s.direct.token}/`, rating: `${site}/scans/${s.direct.token}/` })
}
console.log(JSON.stringify(out, null, 1))

// Writes source_url and source_depth into data/provisions.json: the deepest address of each provision in its source.
// Run: node tools/source-links.mjs [dir with mcp.html, nist-<function>.html fetched from the sources]
// With the directory, an anchor is written only if it is found in the fetched page. Without it, existing links are kept.
import fs from 'node:fs'
import path from 'node:path'
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), dir = process.argv[2]
const f = path.join(ROOT, 'data/provisions.json'), P = JSON.parse(fs.readFileSync(f, 'utf8'))
const S = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/standards.json'), 'utf8')).map(s => [s.id, s]))
const page = n => dir && fs.existsSync(path.join(dir, n)) ? fs.readFileSync(path.join(dir, n), 'utf8') : null
const text = h => h.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ')
// the MCP page, cut into sections by heading id
const mcp = page('mcp.html'), mcpSecs = mcp ? [...mcp.matchAll(/<h[2-4][^>]*id="([a-z0-9-]+)"/g)].map((m, i, a) => ({ id: m[1], body: text(mcp.slice(m.index, a[i + 1] ? a[i + 1].index : mcp.length)) })) : []
const today = new Date().toISOString().slice(0, 10)
let deep = 0
for (const p of P) {
    const s = S[p.standard]; let url = null, depth = null
    if (p.standard === 'nist') { const [fn, n] = p.ref.split(' '), F = fn[0] + fn.slice(1).toLowerCase(), h = page(`nist-${fn.toLowerCase()}.html`), id = `${F}%20${n}`
        if (h && h.includes(`id="${id}"`)) { url = `https://airc.nist.gov/airmf-resources/playbook/${fn.toLowerCase()}/#${id}`; depth = 'the subcategory, in the NIST AI RMF Playbook (anchor found in the page)' } }
    else if (p.standard === 'aiact') { url = `${s.url}#art_${p.ref.replace(/\D/g, '')}`; depth = 'the article, by the anchor EUR-Lex gives articles; not checked by fetch, because EUR-Lex does not answer an automated read' }
    else if (p.standard === 'mcp' && mcpSecs.length) { const norm = x => x.replace(/[^A-Za-z0-9]+/g, ' ').toLowerCase().trim(), key = norm(p.text).split(' ').slice(0, 7).join(' ')
        const hit = mcpSecs.filter(x => norm(x.body).includes(key)).pop()      // the deepest heading that holds the opening words
        if (hit) { url = `${s.url}#${hit.id}`; depth = 'the section of the specification that holds the requirement (its opening words were found there)' } }
    if (url) { p.source_url = url; p.source_depth = depth; p.source_linked = today; deep++ }
    else if (!p.source_url) { p.source_url = s.url; p.source_depth = 'the document: its publisher gives no deeper address for this item'; p.source_linked = today }
}
fs.writeFileSync(f, JSON.stringify(P, null, 1) + '\n')
console.log(`${P.length} provisions; ${P.filter(p => !/^the document/.test(p.source_depth)).length} with an address deeper than the document (${deep} written now)`)

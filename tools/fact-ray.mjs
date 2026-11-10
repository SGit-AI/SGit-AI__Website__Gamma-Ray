// FACT-Ray well-known files: a validator and a read-only reader. No dependencies.
//   node tools/fact-ray.mjs validate <file or https URL>     checks a fact-ray.json against schema 0.1
//   node tools/fact-ray.mjs read <domain> [--save]           fetches https://<domain>/.well-known/fact-ray.json, validates it,
//                                                            and prints each claim with the coordinates it is read at
// With --save the file is kept, with its hash and read time, in data/fact-ray/read/<domain>.json; the build then adds its
// claims to the facts of every scan whose `domain` is that domain.
// The reader sends no credentials and tests nothing: it fetches one public file.
import fs from 'node:fs'
const isUrl = s => typeof s === 'string' && /^https:\/\/[^\s]+$/.test(s), isDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
const NODE = /^(gamma-ray:(indicator|provision)\/[A-Za-z0-9.-]+|node:.+)$/
// returns a list of problems; an empty list means the file is valid. servedFrom: the domain it was fetched from, if any.
export function validate(o, servedFrom = null) {
    const bad = [], need = (c, msg) => { if (!c) bad.push(msg) }
    if (!o || typeof o !== 'object' || Array.isArray(o)) return ['the file is not a JSON object']
    need(o.fact_ray === '0.1', 'fact_ray must be "0.1"')
    need(['subject', 'counterparty'].includes(o.kind), 'kind must be "subject" or "counterparty"')
    for (const k of ['issuer', 'subject']) need(o[k] && typeof o[k].name === 'string' && typeof o[k].domain === 'string' && /^[a-z0-9.-]+\.[a-z]{2,}$/.test(o[k].domain), `${k} needs a name and a domain`)
    need(isDate(o.issued), 'issued must be a date (YYYY-MM-DD)')
    if (o.kind === 'subject' && o.issuer && o.subject) need(o.issuer.domain === o.subject.domain, 'a subject file is issued by the subject: issuer.domain must equal subject.domain')
    if (o.kind === 'counterparty' && o.issuer && o.subject) need(o.issuer.domain !== o.subject.domain, 'a counterparty file is issued from another domain than the subject\'s')
    if (servedFrom && o.issuer) need(servedFrom === o.issuer.domain || servedFrom.endsWith('.' + o.issuer.domain), `served from ${servedFrom}, but issuer.domain is ${o.issuer.domain}: the domain is the identity check`)
    need(Array.isArray(o.claims) && o.claims.length > 0, 'claims must be a list with at least one claim')
    for (const [i, c] of (Array.isArray(o.claims) ? o.claims : []).entries()) { const at = `claims[${i}]`
        need(typeof c.node === 'string' && NODE.test(c.node), `${at}.node must be gamma-ray:indicator/<id>, gamma-ray:provision/<id> or a node: address`)
        need(['yes', 'no', 'partly'].includes(c.asserts), `${at}.asserts must be yes, no or partly`)
        need(typeof c.role === 'string' && c.role.length > 1, `${at}.role: name the role that stands behind the claim`)
        need(!/@[a-z0-9-]+\.[a-z]{2,}|\+?\d[\d ()-]{8,}\d/i.test((c.role || '').replace(/[a-z.]+@web-summit\.dinis/g, '')), `${at}.role: a role, not a contact detail`)
        if (c.evidence !== undefined) need(Array.isArray(c.evidence) && c.evidence.every(isUrl), `${at}.evidence must be a list of https addresses`)
        if (c.as_of !== undefined) need(isDate(c.as_of), `${at}.as_of must be a date`)
        if (c.statement !== undefined) need(typeof c.statement === 'string' && c.statement.length <= 400, `${at}.statement: one short statement`)
    }
    return bad
}
// the coordinates a claim in a well-known file is read at, before anyone has checked it
export function readAs(o, c) { return { source: o.kind === 'counterparty' ? 'S3' : 'S2', record: c.evidence && c.evidence.length ? 'R4' : 'R3', accountability: 'A0' } }

if (process.argv[1] && process.argv[1].endsWith('fact-ray.mjs')) {
    const [cmd, arg] = process.argv.slice(2)
    if (!cmd || !arg) { console.log('usage: node tools/fact-ray.mjs validate <file or https URL> | read <domain>'); process.exit(2) }
    const url = cmd === 'read' ? `https://${arg}/.well-known/fact-ray.json` : isUrl(arg) ? arg : null
    let text
    if (url) { const r = await fetch(url, { redirect: 'follow' }); if (!r.ok) { console.log(`${url}: ${r.status}. No file is no data, not a no.`); process.exit(1) } text = await r.text() } else text = fs.readFileSync(arg, 'utf8')
    let o; try { o = JSON.parse(text) } catch { console.log('not JSON'); process.exit(1) }
    const bad = validate(o, url ? new URL(url).hostname : null)
    if (bad.length) { console.log('NOT VALID\n' + bad.map(b => '- ' + b).join('\n')); process.exit(1) }
    console.log(`OK: ${o.kind} file of ${o.issuer.name} about ${o.subject.name}, ${o.claims.length} claims`)
    if (cmd === 'read' && process.argv.includes('--save')) { const { createHash } = await import('node:crypto'), dir = new URL('../data/fact-ray/read/', import.meta.url).pathname
        fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(dir + arg + '.json', JSON.stringify({ url, domain: arg, read_at: new Date().toISOString().slice(0, 16) + 'Z', sha256: createHash('sha256').update(text).digest('hex'), file: o }, null, 1) + '\n'); console.log('saved data/fact-ray/read/' + arg + '.json') }
    if (cmd === 'read') for (const c of o.claims) { const r = readAs(o, c); console.log(`${c.node}  ${c.asserts}  ${r.source}·${r.record}·${r.accountability}  (${c.role})`) }
}

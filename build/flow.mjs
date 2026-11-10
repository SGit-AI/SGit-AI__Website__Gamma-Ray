// The flow from a stand to a card, drawn from data/flow.json: a swimlane (who does each step: a person, an agent,
// code) and a rail (what each step does, leaves on record, and how far the facts can be trusted after it).
import { claimBand } from './factray.mjs'
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const LANES = ['human', 'agent', 'code']

export function flowHtml(F, fr, up) {
    const band = t => { if (!t) return null; const [S, R, A] = t.split('·'); return claimBand(fr, { source: { level: S }, record: { level: R }, accountability: { level: A } }).band }
    const W = 1200, H = 300, x0 = 120, dx = (W - x0 - 40) / (F.steps.length - 1), ly = k => 70 + LANES.indexOf(k) * 80
    const pos = s => ({ x: x0 + (s.n - 1) * dx, y: ly(s.kind) })
    let svg = `<svg class="fl-lanes" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="fl-t"><title id="fl-t">${esc(F.name)}: twelve steps across three lanes, a person, an agent and code</title>`
    svg += LANES.map(k => `<g class="fl-lane fl-${k}"><rect x="0" y="${ly(k) - 30}" width="${W}" height="60" rx="10"/><text x="16" y="${ly(k) + 5}">${esc(F.kinds[k].split(':')[0].replace(/^an? /, '').replace('AI agent of this team', 'agent'))}</text></g>`).join('')
    for (let i = 1; i < F.steps.length; i++) { const a = pos(F.steps[i - 1]), b = pos(F.steps[i]); svg += `<path class="fl-edge" d="M${a.x},${a.y} C${(a.x + b.x) / 2},${a.y} ${(a.x + b.x) / 2},${b.y} ${b.x},${b.y}"/>` }
    for (const l of F.loops) { const a = pos(F.steps.find(s => s.id === l.from)), b = pos(F.steps.find(s => s.id === l.to)), top = 18; svg += `<path class="fl-loop" d="M${a.x},${a.y - 16} C${a.x},${top} ${b.x},${top} ${b.x},${b.y - 16}" marker-end="url(#fl-arr)"><title>${esc(l.says)}</title></path>` }
    svg += `<defs><marker id="fl-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="fl-arrhead"/></marker></defs>`
    svg += F.steps.map(s => { const p = pos(s), b = band(s.trust); return `<a href="#step-${s.id}"><g class="fl-node fl-${s.kind}"><circle cx="${p.x}" cy="${p.y}" r="17"/><text class="fl-n" x="${p.x}" y="${p.y + 5}">${s.n}</text><text class="fl-label" x="${p.x}" y="${p.y + 36}">${esc(s.name.replace('Sign off and publish', 'Sign off').replace('Is there an agent?', 'Agent?').replace('Confirm or attest', 'Confirm'))}</text>${b ? `<text class="fl-pi" x="${p.x}" y="${p.y - 24}">π ${b}</text>` : ''}</g></a>` }).join('')
    svg += `</svg>`
    const rail = `<ol class="fl-rail">` + F.steps.map(s => { const b = band(s.trust)
        return `<li id="step-${s.id}" class="fl-step fl-${s.kind}"><div class="fl-num">${s.n}</div><div class="fl-body"><div class="fl-head"><b>${esc(s.name)}</b><span class="fl-kind">${esc(s.kind === 'human' ? 'a person' : s.kind === 'agent' ? 'an agent' : 'code')}</span></div><div class="fl-actor">${esc(s.actor)}</div><p>${esc(s.does)}</p><div class="fl-meta"><span><i>Leaves</i> ${esc(s.leaves)}</span>${s.trust ? `<a class="fl-trust" href="${up}fact-ray/matrix/#${s.trust.split('·').slice(0, 2).join('')}" title="${esc(s.trust_reads)}">π ${b} · ${s.trust}</a>` : ''}</div>${s.trust ? `<p class="fl-why">${esc(s.trust_reads.charAt(0).toUpperCase() + s.trust_reads.slice(1))}.</p>` : ''}</div></li>` }).join('') + `</ol>`
    return { svg, rail }
}

// Figures, drawn at build time as inline SVG from the model. No library; colours come from CSS classes.
import { TIERS, TIER_LABEL } from './model.mjs'
import { card } from './spectrum.mjs'
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const short = (s, n) => s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s

// 1. The mashup: questions, indicators, provisions, as three linked columns.
export function graph(m, scanId) {
    const scan = scanId && m.scans.find(x => x.id === scanId), lit = scan ? new Set(Object.keys(scan.answers)) : null
    const hit = ok => lit && ok ? ' hit' : ''
    const W = 1180, top = 46, rowQ = 40, H = top + m.questions.length * rowQ + 30
    const xQ = 345, xI = 590, xP = 820
    const qy = new Map(), iy = new Map(), pxy = new Map()
    m.questions.forEach((q, k) => qy.set(q.id, top + k * rowQ + rowQ / 2))
    const ih = (H - top - 30) / m.indicators.length
    m.indicators.forEach((i, k) => iy.set(i.id, top + k * ih + ih / 2))
    // provisions: one band per standard, dots in rows
    const bandH = (H - top - 30) / m.standards.length, cols = 29, step = 11.5
    m.standards.forEach((s, si) => {
        const ps = m.provisions.filter(p => p.standard === s.id)
        ps.forEach((p, k) => pxy.set(p.id, [xP + 16 + (k % cols) * step, top + si * bandH + 22 + Math.floor(k / cols) * step]))
    })
    let o = `<svg class="fig graph${lit ? ' on lit' : ''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="The mashup as a graph: ${m.totals.questions} questions on the left, ${m.totals.indicators} indicators in the middle, ${m.totals.provisions} provisions of ${m.totals.standards} instruments on the right, joined by ${m.totals.links} links.">`
    o += `<text class="colhead" x="${xQ}" y="22" text-anchor="end">${m.totals.questions} questions</text><text class="colhead" x="${xI}" y="22" text-anchor="middle">${m.totals.indicators} indicators</text><text class="colhead" x="${xP + 16}" y="22">${m.totals.provisions} provisions, by instrument</text>`
    // links indicator -> provision
    for (const i of m.indicators) for (const l of i.links) {
        const [px, py] = pxy.get(l.provision), y = iy.get(i.id), mx = (xI + px) / 2
        o += `<path class="e s-${m.P.get(l.provision).standard} q-${i.question}${l.relation === 'negation' ? ' neg' : ''}${hit(lit?.has(i.id))}" d="M${xI + 5},${y.toFixed(1)} C${mx},${y.toFixed(1)} ${mx},${py.toFixed(1)} ${px - 4},${py.toFixed(1)}"/>`
    }
    for (const q of m.questions) for (const i of q.ind) {
        const y1 = qy.get(q.id), y2 = iy.get(i.id), mx = (xQ + xI) / 2
        o += `<path class="e qi q-${q.id}${hit(lit?.has(i.id))}" d="M${xQ + 8},${y1} C${mx},${y1} ${mx},${y2.toFixed(1)} ${xI - 5},${y2.toFixed(1)}"/>`
    }
    m.standards.forEach((s, si) => {
        const y = top + si * bandH
        o += `<text class="band s-${s.id}" x="${xP + 16}" y="${y + 12}">${esc(s.short)} <tspan class="dim">${s.linked} of ${s.n} linked</tspan></text>`
    })
    for (const p of m.provisions) { const [x, y] = pxy.get(p.id); o += `<circle class="p s-${p.standard}${p.by.length ? '' : ' out'} ${p.by.map(b => 'q-' + m.I.get(b.indicator).question).join(' ')}${hit(p.by.some(b => lit?.has(b.indicator)))}" cx="${x}" cy="${y}" r="3.6"><title>${esc(m.S.get(p.standard).short + ', ' + p.ref + ': ' + short(p.text, 140))}</title></circle>` }
    for (const i of m.indicators) o += `<circle class="i t-${i.tier} q-${i.question}${hit(lit?.has(i.id))}" cx="${xI}" cy="${iy.get(i.id).toFixed(1)}" r="4"><title>${esc(i.text + ' (' + TIER_LABEL[i.tier] + ' tier; cites ' + i.links.length + ')')}</title></circle>`
    for (const q of m.questions) {
        const y = qy.get(q.id)
        o += `<g class="q q-${q.id}${hit(q.ind.some(i => lit?.has(i.id)))}" data-q="${q.id}" tabindex="0"><rect x="0" y="${y - rowQ / 2 + 2}" width="${xQ + 14}" height="${rowQ - 4}" rx="4"/><text x="${xQ - 6}" y="${y - 2}" text-anchor="end">${esc(short(q.text, 46))}</text><text class="dim" x="${xQ - 6}" y="${y + 12}" text-anchor="end">${q.id.replace('Q', 'Q ')} · ${q.axis} · ${q.provisions.length} provisions in ${q.standards.length} instrument${q.standards.length === 1 ? '' : 's'}</text><circle cx="${xQ + 6}" cy="${y}" r="5" class="ax-${q.axis}"/></g>`
    }
    if (lit) return o + `</svg><p class="figcap">Lit: the ${lit.size} indicators with evidence for this agent, the questions they answer and the provisions they reach.</p>`
    return o + '</svg><p class="figcap">Hover or tab to a question to see what one answer reaches. Hollow dots are provisions that no question reaches yet. Dashed lines are provisions that describe the absence of something.</p>'
}

// 2. The compression, as four bars.
export function funnel(m) {
    const t = m.totals, rows = [['Provisions read, in ' + t.standards + ' instruments', t.provisions], ['Provisions that a question reaches', t.linked], ['Indicators: one observable fact each', t.indicators], ['Questions', t.questions]]
    const W = 760, bh = 34, gap = 14, x0 = 300, max = t.provisions
    let o = `<svg class="fig funnel" viewBox="0 0 ${W} ${rows.length * (bh + gap) + 6}" role="img" aria-label="${rows.map(r => r[0] + ': ' + r[1]).join('; ')}.">`
    rows.forEach(([label, n], k) => {
        const y = k * (bh + gap) + 4, w = Math.max(6, (W - x0 - 70) * n / max)
        o += `<text x="${x0 - 12}" y="${y + bh / 2 + 5}" text-anchor="end">${esc(label)}</text><rect class="bar b${k}" x="${x0}" y="${y}" width="${w.toFixed(1)}" height="${bh}" rx="3"/><text class="num" x="${(x0 + w + 10).toFixed(1)}" y="${y + bh / 2 + 6}">${n}</text>`
    })
    return o + '</svg>'
}

// 3. Coverage of each instrument, by the tier at which its provisions can be answered.
export function coverage(m) {
    const W = 860, bh = 24, gap = 12, x0 = 190, bw = W - x0 - 150
    let o = `<svg class="fig cov" viewBox="0 0 ${W} ${m.standards.length * (bh + gap) + 34}" role="img" aria-label="Coverage of each instrument by tier. ${m.standards.map(s => `${s.short}: ${pct(s.tiers.public, s.n)} public, ${pct(s.tiers.declared, s.n)} declared, ${pct(s.tiers.evidenced, s.n)} evidenced, ${pct(s.n - s.linked, s.n)} not reached`).join('. ')}.">`
    m.standards.forEach((s, k) => {
        const y = k * (bh + gap) + 4; let x = x0
        o += `<text x="${x0 - 12}" y="${y + bh / 2 + 5}" text-anchor="end">${esc(s.short)}</text>`
        for (const t of TIERS) { const w = bw * s.tiers[t] / s.n; if (w > 0) o += `<rect class="t-${t}" x="${x.toFixed(1)}" y="${y}" width="${Math.max(0, w - 2).toFixed(1)}" height="${bh}" rx="2"><title>${TIER_LABEL[t]}: ${s.tiers[t]} of ${s.n}</title></rect>`; x += w }
        const w = bw * (s.n - s.linked) / s.n; if (w > 0) o += `<rect class="t-none" x="${x.toFixed(1)}" y="${y}" width="${Math.max(0, w - 2).toFixed(1)}" height="${bh}" rx="2"><title>Not reached: ${s.n - s.linked} of ${s.n}</title></rect>`
        o += `<text class="num sm" x="${x0 + bw + 10}" y="${y + bh / 2 + 5}">${pct(s.tiers.public, s.n)} public · ${s.n}</text>`
    })
    const ly = m.standards.length * (bh + gap) + 18; let lx = x0
    for (const [c, l] of [['t-public', 'Public'], ['t-declared', 'Declared'], ['t-evidenced', 'Evidenced'], ['t-none', 'Not reached by a question']]) { o += `<rect class="${c}" x="${lx}" y="${ly - 10}" width="12" height="12" rx="2"/><text class="sm" x="${lx + 18}" y="${ly}">${l}</text>`; lx += 30 + l.length * 7.2 }
    return o + '</svg>'
}
export const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '0%'

// 4. One answer, many needles: questions by instruments, the number of provisions each answer reaches.
export function matrix(m) {
    const cw = 62, rh = 26, x0 = 330, y0 = 64, W = x0 + m.standards.length * cw + 10, H = y0 + m.questions.length * rh + 8
    let o = `<svg class="fig matrix" viewBox="0 0 ${W} ${H}" role="img" aria-label="For each question, how many provisions of each instrument one answer reaches.">`
    m.standards.forEach((s, k) => { o += `<text class="sm s-${s.id}" transform="translate(${x0 + k * cw + cw / 2 - 4},${y0 - 8}) rotate(-35)">${esc(s.short)}</text>` })
    const max = Math.max(...m.questions.flatMap(q => m.standards.map(s => q.provisions.filter(id => m.P.get(id).standard === s.id).length)))
    m.questions.forEach((q, r) => {
        const y = y0 + r * rh
        o += `<text x="${x0 - 10}" y="${y + rh / 2 + 4}" text-anchor="end">${esc(short(q.text, 48))}</text>`
        m.standards.forEach((s, k) => {
            const n = q.provisions.filter(id => m.P.get(id).standard === s.id).length
            o += `<rect class="cell${n ? '' : ' zero'}" x="${x0 + k * cw + 2}" y="${y + 2}" width="${cw - 4}" height="${rh - 4}" rx="3" style="${n ? `fill-opacity:${(0.18 + 0.82 * n / max).toFixed(2)}` : ''}"><title>${esc(q.text)} ${s.short}: ${n}</title></rect>` + (n ? `<text class="cn${n / max > 0.5 ? ' inv' : ''}" x="${x0 + k * cw + cw / 2}" y="${y + rh / 2 + 4}" text-anchor="middle">${n}</text>` : '')
        })
    })
    return o + '</svg>'
}

// 5. The quadrant: freedom against governance, the cleared zone, and the scans.
export function quadrant(m, only) {
    const c = 62, cw = 118, x0 = 130, y0 = 14, W = x0 + 5 * cw + 16, H = y0 + 5 * c + 62
    const G = m.levels.governance, F = m.levels.freedom
    let o = `<svg class="fig quad" viewBox="0 0 ${W} ${H}" role="img" aria-label="Freedom against governance. A cell is cleared when the governance level supports that much freedom.">`
    for (let g = 0; g <= 4; g++) for (let f = 1; f <= 5; f++) {
        const ok = f <= G[g].clears, x = x0 + (f - 1) * cw, y = y0 + (4 - g) * c
        o += `<rect class="${ok ? 'ok' : 'over'}" x="${x + 2}" y="${y + 2}" width="${cw - 4}" height="${c - 4}" rx="4"><title>Freedom ${f}, governance ${g}: ${ok ? 'held' : 'reaches further than its governance supports; held at ' + G[g].clears}</title></rect>`
    }
    G.forEach(g => o += `<text x="${x0 - 12}" y="${y0 + (4 - g.level) * c + c / 2 + 4}" text-anchor="end">${g.level} ${esc(g.name)}</text>`)
    F.forEach(f => o += `<text x="${x0 + (f.level - 1) * cw + cw / 2}" y="${y0 + 5 * c + 18}" text-anchor="middle">${f.level} ${esc(f.name)}</text>`)
    o += `<text class="axis" x="${x0 + 2.5 * cw}" y="${y0 + 5 * c + 44}" text-anchor="middle">Freedom: what the agent does on its own →</text><text class="axis" transform="translate(18,${y0 + 2.5 * c}) rotate(-90)" text-anchor="middle">Governance: how it is controlled →</text>`
    const scans = m.scans.filter(s => !s.product && (!only || s.id === only)), seen = {}
    const at = (f, g) => [x0 + (f - 1) * cw + 12, y0 + (4 - g) * c + 6]
    const nm = s => short(s.name.replace(/^The /, '').replace(/ agent team$/, '').replace(/\.news$/, '').replace(/^RiskMandate Publisher$/, 'RM Publisher'), 17)
    for (const s of scans) {
        const k = s.freedom + '-' + s.governance, n = seen[k] = (seen[k] || 0) + 1, [x, yy] = at(s.freedom, s.governance), y = yy + n * 16
        if (s.claimed.governance !== s.governance) { const [px, py] = at(s.freedom, s.claimed.governance); o += `<path class="range" d="M${x},${y - 4} L${px},${py + 12}"/><circle class="dot pot" cx="${px}" cy="${py + 12}" r="4.5"><title>${esc(s.name)}: where its own statements would put it</title></circle><text class="lab dim" x="${px + 9}" y="${py + 16}">claimed</text>` }
        o += `<circle class="dot" cx="${x}" cy="${y - 4}" r="4.5"/><text class="lab" x="${x + 9}" y="${y}">${esc(nm(s))}</text>`
    }
    return o + '</svg>'
}

// 6. How the instruments connect: for each pair, the number of indicators that cite both.
export function pairs(m) {
    const S = m.standards, cw = 74, rh = 34, x0 = 150, y0 = 78, W = x0 + S.length * cw + 8, H = y0 + S.length * rh + 6
    const n = (a, b) => a === b ? m.standards.find(s => s.id === a).indicators : (m.pairs[a < b ? a + '|' + b : b + '|' + a] || []).length
    const max = Math.max(...S.flatMap(a => S.filter(b => b.id !== a.id).map(b => n(a.id, b.id))))
    let o = `<svg class="fig matrix pairs" viewBox="0 0 ${W} ${H}" role="img" aria-label="For each pair of instruments, how many indicators cite both.">`
    S.forEach((s, k) => { o += `<text class="sm s-${s.id}" transform="translate(${x0 + k * cw + cw / 2 - 6},${y0 - 8}) rotate(-35)">${esc(s.short)}</text><text class="sm s-${s.id}" x="${x0 - 10}" y="${y0 + k * rh + rh / 2 + 4}" text-anchor="end">${esc(s.short)}</text>` })
    S.forEach((a, r) => S.forEach((b, k) => { const v = n(a.id, b.id), d = a.id === b.id
        o += `<rect class="cell${d ? ' diag' : v ? '' : ' zero'}" x="${x0 + k * cw + 2}" y="${y0 + r * rh + 2}" width="${cw - 4}" height="${rh - 4}" rx="3" style="${!d && v ? `fill-opacity:${(0.15 + 0.85 * v / max).toFixed(2)}` : ''}"><title>${esc(a.short)} and ${esc(b.short)}: ${v}</title></rect>` + (v ? `<text class="cn${!d && v / max > 0.5 ? ' inv' : ''}" x="${x0 + k * cw + cw / 2}" y="${y0 + r * rh + rh / 2 + 4}" text-anchor="middle">${v}</text>` : '') }))
    return o + '</svg><p class="figcap">Off the diagonal: indicators that cite both instruments. On the diagonal: indicators that cite that instrument at all.</p>'
}

// 7. The same connections as a ring: one node per instrument, one band per pair, as thick as the indicators they share.
export function ring(m) {
    const S = m.standards, W = 760, H = 560, cx = W / 2, cy = H / 2 + 4, r = 200
    const pos = Object.fromEntries(S.map((s, k) => { const a = -Math.PI / 2 + 2 * Math.PI * k / S.length; return [s.id, [cx + r * Math.cos(a), cy + r * Math.sin(a), a]] }))
    const max = Math.max(...Object.values(m.pairs).map(v => v.length))
    let o = `<svg class="fig ring" viewBox="0 0 ${W} ${H}" role="img" aria-label="The instruments as a ring, joined by the indicators they share. ${Object.entries(m.pairs).sort((a, b) => b[1].length - a[1].length).slice(0, 6).map(([k, v]) => k.split('|').map(id => m.S.get(id).short).join(' and ') + ': ' + v.length).join('; ')}.">`
    for (const [k, v] of Object.entries(m.pairs).sort((a, b) => a[1].length - b[1].length)) { const [a, b] = k.split('|'), [x1, y1] = pos[a], [x2, y2] = pos[b]
        o += `<path class="band" d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx},${cy} ${x2.toFixed(1)},${y2.toFixed(1)}" style="stroke-width:${(1 + 13 * v.length / max).toFixed(1)};opacity:${(0.25 + 0.6 * v.length / max).toFixed(2)}"><title>${esc(m.S.get(a).short)} and ${esc(m.S.get(b).short)}: ${v.length} shared indicators</title></path>` }
    for (const s of S) { const [x, y, a] = pos[s.id], lx = cx + (r + 22) * Math.cos(a), ly = cy + (r + 22) * Math.sin(a)
        o += `<circle class="node s-${s.id}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(7 + s.indicators / 4).toFixed(1)}"/><text class="s-${s.id} nl" x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="${Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle'}">${esc(s.short)} <tspan class="dim">${s.indicators}</tspan></text>` }
    return o + '</svg><p class="figcap">A node is as large as the number of indicators that cite the instrument. A band is as thick as the number two instruments share.</p>'
}

// 8. Every scan against every question: how many of the question's indicators have evidence.
export function scanMatrix(m) {
    const cw = 118, rh = 26, x0 = 330, y0 = 70, W = x0 + m.scans.length * cw + 10, H = y0 + m.questions.length * rh + 8
    let o = `<svg class="fig matrix" viewBox="0 0 ${W} ${H}" role="img" aria-label="For each scan and each question, the number of indicators with evidence.">`
    m.scans.forEach((s, k) => { o += `<text class="sm" transform="translate(${x0 + k * cw + 14},${y0 - 8}) rotate(-20)">${esc(short(s.name.replace(/^The /, ''), 26))}</text>` })
    m.questions.forEach((q, r) => { const y = y0 + r * rh
        o += `<text x="${x0 - 10}" y="${y + rh / 2 + 4}" text-anchor="end">${esc(short(q.text, 48))}</text>`
        m.scans.forEach((s, k) => { const a = q.ind.filter(i => s.answers[i.id] && s.answers[i.id].m !== 'available').length, b = q.ind.filter(i => s.answers[i.id]?.m === 'available').length, f = a / q.ind.length
            o += `<rect class="cell${a ? '' : ' zero'}" x="${x0 + k * cw + 2}" y="${y + 2}" width="${cw - 4}" height="${rh - 4}" rx="3" style="${a ? `fill-opacity:${(0.2 + 0.8 * f).toFixed(2)}` : ''}"><title>${esc(s.name)}: ${a} of ${q.ind.length} evidenced${b ? ', ' + b + ' more available' : ''}</title></rect><text class="cn${f > 0.5 ? ' inv' : ''}" x="${x0 + k * cw + cw / 2}" y="${y + rh / 2 + 4}" text-anchor="middle">${a || b ? a + ' of ' + q.ind.length + (b ? ' +' + b : '') : ''}</text>` }) })
    return o + '</svg><p class="figcap">"3 of 5 +1" reads: three of the question\'s five indicators have evidence, and one more is a control the operator can turn on.</p>'
}

// 9. The grant: the 23 capabilities by how far they reach, each coloured by what stands in the way.
export function grantGrid(m, id) {
    const s = m.scans.find(x => x.id === id); if (!s || !s.grant) return ''
    const reaches = ['project', 'self', 'host', 'tenant', 'world'], row = Object.fromEntries(s.grant.rows.map(r => [r.capability, r])), want = new Set(s.mandate?.want || [])
    const tw = 284, th = 40, x0 = 76, y0 = 8, per = 3; let y = y0, o = ''
    for (const reach of reaches) { const caps = m.lens.capabilities.filter(c => c.reach === reach)
        o += `<text class="rl" x="${x0 - 10}" y="${y + th / 2 + 4}" text-anchor="end">${reach}</text>`
        caps.forEach((c, k) => { const r = row[c.id], x = x0 + (k % per) * tw, yy = y + Math.floor(k / per) * th
            o += `<g><rect class="${r ? 'b-' + r.barrier : 'b-out'}" x="${x + 2}" y="${yy + 2}" width="${tw - 4}" height="${th - 4}" rx="4"/><text class="cap${r ? '' : ' dim'}" x="${x + 10}" y="${yy + 17}">${esc(c.id)}</text><text class="sm${r ? ' on' : ''}" x="${x + 10}" y="${yy + 31}">${r ? esc(r.barrier + ' · ' + r.evidence) + (s.mandate ? want.has(c.id) ? ' · wanted' : ' · excess' : '') : 'not in the grant'}</text><title>${esc(c.gloss)}</title></g>` })
        y += Math.ceil(caps.length / per) * th + 6 }
    const leg = [['b-none', 'nothing in the way'], ['b-expectation', 'a rule in prose'], ['b-setting', 'a setting it could change'], ['b-boundary', 'a boundary outside its reach']]; let lx = x0
    for (const [c, l] of leg) { o += `<rect class="${c}" x="${lx}" y="${y + 6}" width="12" height="12" rx="2"/><text class="sm" x="${lx + 18}" y="${y + 16}">${l}</text>`; lx += 34 + l.length * 6.6 }
    return `<svg class="fig grant" viewBox="0 0 ${x0 + per * tw + 6} ${y + 26}" role="img" aria-label="The grant of ${esc(s.name)}: ${s.g.size} of ${m.lens.capabilities.length} capabilities, ${s.g.bounded} of them behind a boundary.">${o}</svg>`
}

// 10. The label: what a rating looks like when it is shown somewhere else.
export function label(m, id) {
    const s = m.scans.find(x => x.id === id), W = 520, H = 168, F = m.levels.freedom
    const big = s.product ? (s.freedom === s.freedomMax ? String(s.freedom) : s.freedom + '-' + s.freedomMax) : String(s.held)
    const cap = s.product ? 'FREEDOM' : 'HELD AT'
    const lines = s.product
        ? [`As shipped: ${s.freedom} ${F[s.freedom - 1].name}` + (s.freedomMax !== s.freedom ? `, up to ${s.freedomMax} ${F[s.freedomMax - 1].name}` : ''), `${s.configs.length} configurations rated`, 'Deployment governance: not assessed', s.g ? `Grant ${s.g.size} of ${m.lens.capabilities.length}, ${s.g.bounded} behind a boundary` : 'Grant: not measured']
        : [`Reaches ${s.freedom} ${F[s.freedom - 1].name}`, `Governance ${s.governance} ${m.levels.governance[s.governance].name}` + (s.claimed.governance !== s.governance ? ` (claims ${s.claimed.governance})` : ''), s.g ? `Grant ${s.g.size} of ${m.lens.capabilities.length}, ${s.g.bounded} behind a boundary` : 'Grant: not measured', s.g?.delta ? `${s.g.delta.excess} in excess of its mandate` : `${s.workOrder.length} item${s.workOrder.length === 1 ? '' : 's'} on its work order`]
    let o = `<svg class="fig label" viewBox="0 0 ${W} ${H}" role="img" aria-label="GAMMA-Ray beta label for ${esc(s.name)}: ${cap.toLowerCase()} ${big}. ${esc(lines.join('. '))}.">`
    o += `<rect class="lb" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12"/><path class="ld" d="M13,1 h137 v${H - 2} h-137 a12,12 0 0 1 -12,-12 v-${H - 26} a12,12 0 0 1 12,-12 z"/>`
    o += `<text class="lcap" x="76" y="34" text-anchor="middle">${cap}</text><text class="lbig${big.length > 1 ? ' sm2' : ''}" x="76" y="104" text-anchor="middle">${big}</text><text class="lof" x="76" y="130" text-anchor="middle">${s.product ? 'by configuration' : 'of 5'}</text>`
    o += `<rect class="lbeta" x="38" y="140" width="76" height="17" rx="8.5"/><text class="lbt" x="76" y="152" text-anchor="middle">BETA RATING</text>`
    o += `<text class="lname" x="168" y="32">${esc(short(s.name, 38))}</text>`
    lines.forEach((l, k) => { o += `<text class="lline" x="168" y="${58 + k * 20}">${esc(l)}</text>` })
    o += `<text class="lfoot" x="168" y="${H - 14}">GAMMA-Ray ${esc(m.levels.version)} · Public tier · ${s.read}</text>`
    return o + '</svg>'
}

// 11. One agent's profile: every indicator as a square, by question.
export function profile(m, id) {
    const s = m.scans.find(x => x.id === id), x0 = 330, sq = 20, rh = 24, y0 = 6, W = x0 + 6 * sq + 250, H = y0 + m.questions.length * rh + 36
    const strong = a => a.g === 'observed' || a.g === 'measured'
    const cls = i => { const a = s.answers[i.id]; if (!a) return 'p-none'; if (a.m === 'available') return 'p-avail'; return i.needs === 'statement' || strong(a) ? 'p-yes' : 'p-claim' }
    let o = `<svg class="fig profile" viewBox="0 0 ${W} ${H}" role="img" aria-label="The profile of ${esc(s.name)}: for each question, which indicators are evidenced, claimed, available or not evidenced.">`
    m.questions.forEach((q, r) => { const y = y0 + r * rh
        o += `<text x="${x0 - 12}" y="${y + 15}" text-anchor="end">${esc(short(q.text, 48))}</text>`
        q.ind.forEach((i, k) => { o += `<rect class="${cls(i)}" x="${x0 + k * sq}" y="${y + 2}" width="${sq - 4}" height="${sq - 4}" rx="3"><title>${esc(i.text)}</title></rect>` })
        const n = q.ind.filter(i => cls(i) === 'p-yes').length; o += `<text class="dim" x="${x0 + 6 * sq + 8}" y="${y + 15}">${n} of ${q.ind.length}${q.axis === 'freedom' ? ' · freedom' : ''}</text>` })
    let lx = x0 - 200; const ly = y0 + m.questions.length * rh + 14
    for (const [c, l] of [['p-yes', 'evidenced'], ['p-claim', 'claimed, not counted'], ['p-avail', 'available'], ['p-none', 'not evidenced']]) { o += `<rect class="${c}" x="${lx}" y="${ly - 11}" width="14" height="14" rx="3"/><text class="sm" x="${lx + 20}" y="${ly}">${l}</text>`; lx += 40 + l.length * 6.8 }
    return o + '</svg>'
}

// 12. A product's configurations: freedom for each, and the controls each brings.
export function configs(m, id) {
    const s = m.scans.find(x => x.id === id); if (!s.product) return ''
    const x0 = 300, cw = 62, rh = 44, y0 = 30, W = x0 + 5 * cw + 250, H = y0 + s.configs.length * rh + 6
    let o = `<svg class="fig cfg" viewBox="0 0 ${W} ${H}" role="img" aria-label="The configurations of ${esc(s.name)} and the freedom level of each: ${s.configs.map(c => c.name + ' ' + c.freedom).join('; ')}.">`
    m.levels.freedom.forEach(f => o += `<text class="sm" x="${x0 + (f.level - 1) * cw + cw / 2}" y="18" text-anchor="middle">${f.level}</text>`)
    o += `<text class="sm" x="${x0 - 12}" y="18" text-anchor="end">Freedom level</text>`
    s.configs.forEach((c, r) => { const y = y0 + r * rh
        o += `<text class="cn2" x="${x0 - 12}" y="${y + 18}" text-anchor="end">${esc(c.name)}</text><text class="dim" x="${x0 - 12}" y="${y + 33}" text-anchor="end">${esc(short(c.note, 44))}</text>`
        for (let f = 1; f <= 5; f++) o += `<rect class="${f <= c.freedom ? 'f-on' : 'f-off'}" x="${x0 + (f - 1) * cw + 2}" y="${y + 6}" width="${cw - 4}" height="${rh - 14}" rx="4"/>`
        o += `<text class="cn2" x="${x0 + 5 * cw + 14}" y="${y + 18}">${c.controls.length} controls</text><text class="dim" x="${x0 + 5 * cw + 14}" y="${y + 33}">${c.added.length ? c.added.length + ' turned on by the operator' : 'all as shipped'}</text>` })
    return o + '</svg>'
}

// 9. The walk of a Spectrum card: card -> four dimensions -> the indicators each level stands on -> the evidence (a link to its
// public source) -> the instruments its provisions sit in. Every node is a link. One column, so it reads on a phone.
// It draws the answer to one question ("what is each level standing on?"), never the whole graph.
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const wrap = (s, n) => { const out = []; let l = ''; for (const w of String(s).split(/\s+/)) { if (l && (l + ' ' + w).length > n) { out.push(l); l = w } else l = l ? l + ' ' + w : w } if (l) out.push(l); return out }
const hostPath = u => { try { const x = new URL(u); return x.host.replace(/^www\./, '') + (x.pathname === '/' ? '' : x.pathname) } catch { return u } }
export function cardWalk(m, sp, scanId, up = '../../../') {
    const scan = m.scans.find(x => x.id === scanId); if (!scan) return ''
    const c = card(scan, sp, m)
    const W = 440, xS = 14, xD = 30, wD = 72, xI = 124, wI = W - xI - 2, LH = 16
    const link = (href, inner, title, ext) => `<a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}><title>${esc(title)}</title>${inner}</a>`
    let y = 0, body = '', spine = [], k = 0
    // the root: the card itself
    const rootT = `${scan.name}: ${c.signature}${c.stage ? ', ' + c.stage : ''}`
    const rl = wrap(rootT, 60)
    body += link(up + 'spectrum/cards/' + scan.id + '/', `<rect class="w-root" x="0" y="0" width="${W}" height="${rl.length * LH + 14}" rx="8"/>` + rl.map((t, i) => `<text class="w-rt" x="12" y="${20 + i * LH}">${esc(t)}</text>`).join(''), `The card: ${scan.name}`)
    y = rl.length * LH + 14 + 18
    const instAll = new Set()
    for (const d of c.dims) {
        const D = sp.dimensions.find(x => x.id === d.id), top = y
        let blocks = '', yy = y
        const anchor = '#' + slug(`${d.name}: ${d.level ? `level ${d.level}, ${d.levelName}` : 'not yet evidenced'}`)
        const ys = []
        for (const id of d.used) {
            const ind = m.I.get(id), a = scan.answers[id], cap = scan.captures?.[a.e], q = m.questions.find(x => x.id === ind.question)
            const il = wrap(ind.text, 41), bh = il.length * LH + 10
            ys.push(yy + bh / 2)
            const qHref = q ? up + 'questions/#' + slug(`${q.id.replace('Q', 'Q ')}. ${q.text}`) : up + 'questions/'
            blocks += link(qHref, `<rect class="w-ind" x="${xI}" y="${yy}" width="${wI}" height="${bh}" rx="6"/><text class="w-id" x="${xI + 8}" y="${yy + 17}">${id}</text>` + il.map((t, i) => `<text x="${xI + 38}" y="${yy + 17 + i * LH}">${esc(t)}</text>`).join(''), `${id}, answers ${q ? q.id + ': ' + q.text : 'a question'} (the questions page)`)
            yy += bh
            // evidence: a link to the public source, with its grade, its mode and the hash of what was captured
            const lab = hostPath(a.e), ev1 = short(lab, 37), ev2 = `${a.g} · ${a.m}${cap?.sha256 ? ' · sha256 ' + cap.sha256.slice(0, 8) : ''}`
            blocks += `<path class="w-edge" d="M${xI + 16} ${yy} v10"/>` + link(a.e, `<rect class="w-ev ${a.m === 'available' ? 'w-av' : ''}" x="${xI + 6}" y="${yy + 10}" width="${wI - 6}" height="40" rx="6"/><text class="w-evt" x="${xI + 16}" y="${yy + 27}">${esc(ev1)} ↗</text><text class="w-sm" x="${xI + 16}" y="${yy + 43}">${esc(ev2)}</text>`, `Evidence: ${a.e} (opens the public source; ${a.g}, ${a.m}${cap?.read_at ? ', captured ' + cap.read_at : ''})`, true)
            yy += 50
            // across to the provisions it touches, grouped by instrument; each chip is a link to the instrument
            const per = new Map(); for (const l of ind.links) { const p = m.P.get(l.provision); if (p) per.set(p.standard, (per.get(p.standard) || 0) + 1) }
            let cx = xI + 16, cy = yy + 10; blocks += `<path class="w-edge" d="M${xI + 16} ${yy} v10"/>`
            if (!per.size) { blocks += `<text class="w-sm" x="${xI + 16}" y="${cy + 15}">touches no provision yet</text>`; cy += 24 }
            for (const [sid, n] of per) {
                const S = m.S.get(sid), t = `${S.short.replace(' authorization', '')} ${n}`, cw = Math.min(wI - 16, t.length * 7.6 + 32)
                if (cx + cw > W) { cx = xI + 16; cy += 28 }
                instAll.add(sid)
                blocks += link(up + 'instruments/#' + slug(S.name), `<g class="s-${sid}"><rect class="w-ch" x="${cx}" y="${cy}" width="${cw}" height="22" rx="11"/><circle class="w-dot" cx="${cx + 11}" cy="${cy + 11}" r="4.5"/><text x="${cx + 21}" y="${cy + 15.5}">${esc(t)}</text></g>`, `${n} provision${n > 1 ? 's' : ''} of ${S.name} (the instruments page)`)
                cx += cw + 6
            }
            yy = cy + 22 + 16
        }
        if (!d.used.length) { ys.push(yy + 14); blocks += `<text class="w-sm" x="${xI}" y="${yy + 18}">Nothing public found yet. Not a no.</text>`; yy += 34 }
        const mid = (ys[0] + ys[ys.length - 1]) / 2
        const nh = Math.max(64, Math.min(yy - top - 8, 96)), ny = top + 4
        let node = `<path class="w-edge" d="M${xS} ${spine.length ? spine[spine.length - 1] : 0} V${ny + 22} h${xD - xS}"/>`
        spine.push(ny + 22)
        node += link(up + 'spectrum/cards/' + scan.id + '/' + anchor, `<g class="sp-${d.id}${d.level ? '' : ' sp-none'}"><rect class="w-dim" x="${xD}" y="${ny}" width="${wD}" height="${nh}" rx="8"/><text class="w-lv" x="${xD + wD / 2}" y="${ny + 30}" text-anchor="middle">${d.id}${d.level || '·'}</text><text class="w-sm" x="${xD + wD / 2}" y="${ny + 47}" text-anchor="middle">${esc(d.name)}</text>${[1, 2, 3, 4].map(n => `<rect class="w-pip${n <= d.level ? ' on' : ''}" x="${xD + 8 + (n - 1) * 15}" y="${ny + 56}" width="12" height="5" rx="2"/>`).join('')}</g>`, `${d.name}: ${d.level ? 'level ' + d.level + ', ' + d.levelName : 'not yet evidenced'} (this card's section)`)
        // elbows from the dimension to each indicator
        const ex = xD + wD + 11
        let edges = `<path class="w-edge" d="M${xD + wD} ${ny + nh / 2} H${ex}${ys.length ? ` M${ex} ${ys[0]} V${ys[ys.length - 1]}` : ''}"/>` + ys.map((v, i) => d.used.length ? `<path class="w-edge" d="M${ex} ${v} H${xI}"/>` : '').join('')
        body += node + edges + blocks
        y = Math.max(yy, top + nh + 8) + 8
    }
    // the spine closes at the last dimension; the root's drop line
    body += `<path class="w-edge" d="M${xS} ${rl.length * LH + 14} V${spine[0]}"/>`
    const H = Math.ceil(y)
    const css = `<style>.walk{--dc:var(--ink3)}.walk text{font:12.5px var(--sans);fill:var(--ink)}.walk a{cursor:pointer}.walk a:hover rect,.walk a:focus rect{stroke:var(--ink);stroke-width:2}.walk .w-edge{fill:none;stroke:var(--ink3);stroke-width:1.5}.walk .w-root{fill:var(--band);stroke:var(--ink);stroke-width:1.5}.walk .w-rt{font:600 13px var(--sans)}.walk .w-dim{fill:var(--band);stroke:var(--dc);stroke-width:2}.walk .w-lv{font:700 22px var(--mono);fill:var(--dc)}.walk .w-sm{font-size:11.5px;fill:var(--ink3)}.walk .sp-A{--dc:var(--t2)}.walk .sp-R{--dc:var(--c-sf)}.walk .sp-C{--dc:var(--accent)}.walk .sp-O{--dc:var(--c-eaamm)}.walk .sp-none{--dc:var(--ink3)}.walk .w-dim{stroke-dasharray:none}.walk .sp-none .w-dim{stroke-dasharray:4 3}.walk .w-pip{fill:var(--hair)}.walk .w-pip.on{fill:var(--dc)}.walk .w-ind{fill:var(--paper);stroke:var(--ink2);stroke-width:1.2}.walk .w-id{font:600 12px var(--mono);fill:var(--ink2)}.walk .w-ev{fill:var(--paper);stroke:var(--accent);stroke-width:1.5}.walk .w-av{stroke-dasharray:5 3}.walk .w-evt{font:12px var(--mono);fill:var(--accent)}.walk .w-ch{fill:var(--paper);stroke:var(--c);stroke-width:1.5}.walk .w-dot{fill:var(--c)}</style>`
    const sentence = `${scan.name}: ${c.dims.map(d => `${d.name} ${d.level ? 'level ' + d.level : 'not yet evidenced'}`).join(', ')}. ${c.answers} evidenced indicators, ${c.sources} sources, ${instAll.size} instruments touched. The same walk is listed in text below.`
    return `<svg class="fig walk" style="min-width:0;max-width:520px;margin:0 auto" viewBox="0 0 ${W} ${H}" role="group" aria-label="${esc(sentence)}">${css}${body}</svg><p class="figcap">The walk down from this card: each dimension, the indicators its level stands on (a link to the question), the public source of each answer (a link out; dashed means available, not default) and the instruments its provisions sit in (a link to the instrument). A solid frame is evidenced; a dashed frame is not yet evidenced, which is not a no.</p>`
}

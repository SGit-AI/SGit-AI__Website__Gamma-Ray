// Figures, drawn at build time as inline SVG from the model. No library; colours come from CSS classes.
import { TIERS, TIER_LABEL } from './model.mjs'
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
    const scans = m.scans.filter(s => !only || s.id === only), seen = {}
    const at = (f, g) => [x0 + (f - 1) * cw + 12, y0 + (4 - g) * c + 6]
    for (const s of scans) {
        const k = s.freedom + '-' + s.governance, n = seen[k] = (seen[k] || 0) + 1
        const [x, y0_] = at(s.freedom, s.governance), y = y0_ + n * 16, P = s.potential
        if (P.freedom !== s.freedom || P.governance !== s.governance) { const [px, py] = at(P.freedom, P.governance); o += `<path class="range" d="M${x},${y - 4} L${px + cw - 30},${py + 16 - 4}"/><circle class="dot pot" cx="${px + cw - 30}" cy="${py + 16 - 4}" r="4"><title>${esc(s.name)}, with its optional controls and modes turned on</title></circle>` }
        o += `<circle class="dot${s.kind === 'product-shape' ? ' prod' : ''}" cx="${x}" cy="${y - 4}" r="4.5"/><text class="lab" x="${x + 9}" y="${y}">${esc(short(s.name.replace(/^The /, '').replace(/ agent team$/, '').replace(/\.news$/, '').replace(/, on your own machine$/, ' (local)').replace(/ on the web$/, ' (web)').replace(/^GitHub Copilot cloud agent$/, 'Copilot agent').replace(/^RiskMandate Publisher$/, 'RM Publisher'), 17))}</text>`
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

// Figures, drawn at build time as inline SVG from the model. No library; colours come from CSS classes.
import { TIERS, TIER_LABEL } from './model.mjs'
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const short = (s, n) => s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s

// 1. The mashup: questions, indicators, provisions, as three linked columns.
export function graph(m) {
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
    let o = `<svg class="fig graph" viewBox="0 0 ${W} ${H}" role="img" aria-label="The mashup as a graph: ${m.totals.questions} questions on the left, ${m.totals.indicators} indicators in the middle, ${m.totals.provisions} provisions of ${m.totals.standards} instruments on the right, joined by ${m.totals.links} links.">`
    o += `<text class="colhead" x="${xQ}" y="22" text-anchor="end">${m.totals.questions} questions</text><text class="colhead" x="${xI}" y="22" text-anchor="middle">${m.totals.indicators} indicators</text><text class="colhead" x="${xP + 16}" y="22">${m.totals.provisions} provisions, by instrument</text>`
    // links indicator -> provision
    for (const i of m.indicators) for (const l of i.links) {
        const [px, py] = pxy.get(l.provision), y = iy.get(i.id), mx = (xI + px) / 2
        o += `<path class="e s-${m.P.get(l.provision).standard} q-${i.question}${l.relation === 'negation' ? ' neg' : ''}" d="M${xI + 5},${y.toFixed(1)} C${mx},${y.toFixed(1)} ${mx},${py.toFixed(1)} ${px - 4},${py.toFixed(1)}"/>`
    }
    for (const q of m.questions) for (const i of q.ind) {
        const y1 = qy.get(q.id), y2 = iy.get(i.id), mx = (xQ + xI) / 2
        o += `<path class="e qi q-${q.id}" d="M${xQ + 8},${y1} C${mx},${y1} ${mx},${y2.toFixed(1)} ${xI - 5},${y2.toFixed(1)}"/>`
    }
    m.standards.forEach((s, si) => {
        const y = top + si * bandH
        o += `<text class="band s-${s.id}" x="${xP + 16}" y="${y + 12}">${esc(s.short)} <tspan class="dim">${s.linked} of ${s.n} linked</tspan></text>`
    })
    for (const p of m.provisions) { const [x, y] = pxy.get(p.id); o += `<circle class="p s-${p.standard}${p.by.length ? '' : ' out'} ${p.by.map(b => 'q-' + m.I.get(b.indicator).question).join(' ')}" cx="${x}" cy="${y}" r="3.6"><title>${esc(m.S.get(p.standard).short + ', ' + p.ref + ': ' + short(p.text, 140))}</title></circle>` }
    for (const i of m.indicators) o += `<circle class="i t-${i.tier} q-${i.question}" cx="${xI}" cy="${iy.get(i.id).toFixed(1)}" r="4"><title>${esc(i.text + ' (' + TIER_LABEL[i.tier] + ' tier; cites ' + i.links.length + ')')}</title></circle>`
    for (const q of m.questions) {
        const y = qy.get(q.id)
        o += `<g class="q q-${q.id}" data-q="${q.id}" tabindex="0"><rect x="0" y="${y - rowQ / 2 + 2}" width="${xQ + 14}" height="${rowQ - 4}" rx="4"/><text x="${xQ - 6}" y="${y - 2}" text-anchor="end">${esc(short(q.text, 46))}</text><text class="dim" x="${xQ - 6}" y="${y + 12}" text-anchor="end">${q.id.replace('Q', 'Q ')} · ${q.axis} · ${q.provisions.length} provisions in ${q.standards.length} instrument${q.standards.length === 1 ? '' : 's'}</text><circle cx="${xQ + 6}" cy="${y}" r="5" class="ax-${q.axis}"/></g>`
    }
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
    for (const s of scans) {
        const k = s.freedom + '-' + s.governance, n = seen[k] = (seen[k] || 0) + 1
        const x = x0 + (s.freedom - 1) * cw + 12, y = y0 + (4 - s.governance) * c + 6 + n * 18
        o += `<circle class="dot" cx="${x}" cy="${y - 4}" r="4.5"/><text class="lab" x="${x + 9}" y="${y}">${esc(short(s.name.replace(/^The /, '').replace(/ agent team$/, '').replace(/\.news$/, ''), 14))}</text>`
    }
    return o + '</svg>'
}

// Hover or focus a question in the mashup graph to light up what one answer reaches.
for (const svg of document.querySelectorAll('svg.graph')) {
  const on = q => { svg.classList.add('on'); svg.querySelectorAll('.q-' + q).forEach(e => e.classList.add('hit')) }
  const off = () => { svg.classList.remove('on'); svg.querySelectorAll('.hit').forEach(e => e.classList.remove('hit')) }
  svg.querySelectorAll('g.q').forEach(g => { const q = g.dataset.q
    g.addEventListener('mouseenter', () => { off(); on(q) }); g.addEventListener('focus', () => { off(); on(q) })
    g.addEventListener('mouseleave', off); g.addEventListener('blur', off) })
}

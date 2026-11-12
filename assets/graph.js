// The mashup graph: hover or focus a question to light up what one answer reaches.
// Click a question to pin it, so the mouse can move across the graph while it stays lit; click it again to open the
// question, click another question to pin that one, and click the background or press Escape to unpin.
for (const svg of document.querySelectorAll('svg.graph:not(.lit)')) {
  let pinned = null
  const note = document.createElement('p'); note.className = 'graph-pin'; note.hidden = true
  svg.insertAdjacentElement('afterend', note)
  const show = q => { svg.classList.add('on'); svg.querySelectorAll('.hit').forEach(e => e.classList.remove('hit')); svg.querySelectorAll('.q-' + q).forEach(e => e.classList.add('hit')) }
  const clear = () => { svg.classList.remove('on'); svg.querySelectorAll('.hit').forEach(e => e.classList.remove('hit')) }
  const rest = () => pinned ? show(pinned.dataset.q) : clear()
  const pin = g => {
    if (pinned) pinned.classList.remove('pinned')
    pinned = g
    if (!g) { note.hidden = true; rest(); return }
    g.classList.add('pinned'); show(g.dataset.q)
    const a = g.querySelector('a'), label = g.querySelector('text') ? g.querySelector('text').textContent : g.dataset.q
    note.hidden = false
    note.innerHTML = ''
    note.append('Pinned: ' + label + ' · ')
    const open = document.createElement('a'); open.href = a ? a.getAttribute('href') : '#'; open.textContent = 'open this question'; note.append(open)
    note.append(' · ')
    const un = document.createElement('button'); un.type = 'button'; un.textContent = 'unpin'; un.addEventListener('click', () => pin(null)); note.append(un)
  }
  svg.querySelectorAll('g.q').forEach(g => {
    const q = g.dataset.q
    g.addEventListener('mouseenter', () => show(q)); g.addEventListener('focusin', () => show(q))
    g.addEventListener('mouseleave', rest); g.addEventListener('focusout', rest)
    g.addEventListener('click', e => { if (pinned !== g) { e.preventDefault(); pin(g) } })   // the second click follows the link
  })
  svg.addEventListener('click', e => { if (!e.target.closest('g.q') && !e.target.closest('a')) pin(null) })
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && pinned) pin(null) })
}

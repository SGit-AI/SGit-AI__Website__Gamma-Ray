/* The feedback form. A message is sealed here, in the browser, to the key of the agent that keeps this site, and
 * appended to a write-only lane. Nothing is stored on this site or in this browser: no cookie, no outside script. */
(function () {
  'use strict'
  var f = document.querySelector('form.fb-form'), cfg = document.getElementById('fb-lane'); if (!f || !cfg) return
  var lane; try { lane = JSON.parse(cfg.textContent) } catch (e) { return }
  var about = new URLSearchParams(location.search).get('about'); if (about && f.elements.about) f.elements.about.value = about.slice(0, 120)
  var me = document.querySelector('script[src*="assets/feedback.js"]'), up = me.getAttribute('src').replace(/assets\/feedback\.js.*$/, '')
  function show(which) { f.querySelectorAll('.fb-status span').forEach(function (s) { s.hidden = !s.hasAttribute('data-' + which) }) }
  f.addEventListener('submit', function (ev) {
    ev.preventDefault()
    var v = function (n) { return String((f.elements[n] || {}).value || '').trim() }
    if (!v('message')) { show('empty'); return }
    var body = { type: 'feedback/v1', kind: v('kind'), about: v('about'), source: v('source'), message: v('message'), from: v('from'), at: new Date().toISOString(), page: location.origin + location.pathname }
    var btn = f.querySelector('button'); btn.disabled = true; show('sending')
    import(new URL(up + 'assets/pki-keys.js', location.href).href).then(function (k) { return k.seal({ encrypt: lane.recipient.encrypt }, JSON.stringify(body)) }).then(function (enc) {
      return fetch(lane.endpoint + '/api/vault/append/write/' + lane.vault_id, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ append_token: lane.append_token, payload: btoa(enc) }) })
    }).then(function (r) { if (!r.ok) throw new Error(r.status); show('sent'); f.reset() }).catch(function () { show('failed') }).then(function () { btn.disabled = false })
  })
})()

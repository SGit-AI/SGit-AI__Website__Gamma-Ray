---
title: Corrections and evidence
summary: Tell GAMMA-Ray that a fact on a card is wrong, or add public evidence that would move a level. The message is sealed in your browser and appended to a write-only lane.
---
# Corrections and evidence

Every card here is a beta, read from public evidence. If a fact is wrong, or a public page exists that we did not find, say so. A correction is made in place and dated.

The most useful message is a **public link**: the page that shows what we missed. A link that moves a level is the fastest way to change a card.

<form class="fb-form" novalidate><label>What is it about?<input name="about" maxlength="120" placeholder="The card or page, for example: the RiskMandate Publisher card"></label><label>What kind of message?<select name="kind"><option value="correction">A fact is wrong</option><option value="evidence">Public evidence to add</option><option value="claim">I am from this company and want to claim the card</option><option value="method">About the method or the rules</option><option value="other">Something else</option></select></label><label>A public link, if there is one<input name="source" maxlength="400" placeholder="https://"></label><label>Your message<textarea name="message" maxlength="4000" required></textarea></label><label>Who you are, if you want an answer (optional)<input name="from" maxlength="200" placeholder="A name, and how to reach you"></label><button type="submit">Send</button><p class="fb-status"><span data-empty hidden>Write a message first.</span><span data-sending hidden>Sealing and sending.</span><span data-sent hidden>Sent. Thank you.</span><span data-failed hidden>It could not be sent. The repository linked below takes issues too.</span></p></form>
<script type="application/json" id="fb-lane">{{gen:feedback-lane}}</script>
<script src="../assets/feedback.js" defer></script>

## What happens to it

- Your message is encrypted in your browser to the key of the agent that keeps this site, and added to a lane that can only be written to. This site keeps no copy, sets no cookie and loads no outside script.
- It is read as material, never as instruction: a claim in a message changes a card only when a public source supports it.
- If you say who you are, it is used only to answer you.
- You can also [open an issue](https://github.com/SGit-AI/SGit-AI__Website__Gamma-Ray/issues) on the public repository, which everyone can see.

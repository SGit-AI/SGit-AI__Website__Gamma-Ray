---
title: What the Spectrum rules did on real evidence
summary: Where the Spectrum rules broke on real evidence, the four corrections of Spectrum 0.2, and every card before and after.
---
# What the rules did on real evidence

The sixteen rules were implemented as the first brief wrote them and run on real scans. Most held. Four did not, and the second brief of 10 November 2026 ([part 1](https://github.com/SGit-AI/SGit-AI__Website__Gamma-Ray/blob/dev/briefs/gamma-ray-brief-2.md)) corrected them. This page keeps both: what broke, what changed, and every card before and after.

{{gen:spectrum-table}}

## The four corrections of Spectrum 0.2, before and after

Every card was scored again with the corrected rules. The evidence did not change; only the rules did. A dash is a dimension that is not yet evidenced. It is never a zero.

{{gen:spectrum-moved}}

**1. The Autonomy hole is closed.** Level three (Acts) asked for an agent that acts and for a public source of production use. An agent that acts with no such source could not fall back to level two (it does not ask approval for each action) or level one (a person does not operate it), so it had no Autonomy level and read as less than a chat assistant. Now Acts is an agent that acts (`I08`) with one of `I17`, `I18`, `I19`. Production use (`S1`) is the **In production** badge: a public source names a customer, or gives usage figures for the capability that acts (sessions, tasks, pull requests; not installs or seats).

**2. No zeros on a card.** A dimension with no evidence prints as a dash in the signature and as "not yet evidenced" in the card. In `cards.json` its level is `null`. The stage sum counts it as nothing.

**3. Reach three can be reached.** Every card sat at Reach two, because level three asked for agents talking to agents (`I14`) or published authorisation metadata (`I24`). A new indicator, `S4` (it exposes an agent interface: a published MCP server, an agent card, or an API documented for agents to call), now also opens level three, with `I25` as before. No scan has been read for `S4` yet, so no card has moved on it; the scans are being read for it now.

**4. Openness one fits products that do not chat.** Level one asked that the product tell the people it talks to that it is an AI (`I56`), which a builder tool has nobody to tell. Now it asks for a stated purpose (`I20`) with one of `I56`, `I22`, `I58`.

## What the corrected rules do that still needs a look

{{gen:spectrum-broke}}

**Acting agents now land on Autonomy four at once.** With production use out of the ladder, level four (Orchestrates) asks for level three, one of `I10`, `I12`, `I13`, and one of `I18`, `I19`. Almost every agent that acts also has connectors (`I10`), so the cards that moved from no level went straight to four, and Autonomy now tells few cards apart at the top, as Reach did at two. That is the rule as written, on the evidence as read.

**Cumulative ladders hide evidence.** A product with a real boundary (Control level four) and no public page on audit logs (level three) sits at Control two. The card shows the higher evidence as "also evidenced", and the next unlock points at the missing level, so nothing is lost; but the signature understates it. The second brief keeps this reading.

## Readings the brief does not give, and what was done

- **"Levels are cumulative within a dimension."** Autonomy and Reach describe alternatives (an agent that orchestrates does not also "work inside its own product"), so taken literally no acting agent could pass level one. They are scored as the highest rule met. Control and Openness build on each other and are scored cumulatively. The second brief confirms this reading.
- **Available features.** The brief says Control level three reads logging, pausing and monitoring as available product features. The scorer counts an available feature in every dimension and marks it. That lifts Claude Code on a machine to Autonomy four and Control four on features an operator has to turn on. If only Control three should read this way, those levels drop.
- **The Verified badge** is given when Openness reaches level four. A product with an independent certificate and no published evaluations has the evidence and not the level, so it has no badge.
- **The certificate.** The certificates cited for Claude Code cover the vendor, not the product or a deployment. They are recorded, and would count for Openness four once level three is met. Whether a vendor-wide certificate should count for a product is open.
- **Production use for our own agents** is evidenced by their public release records, which are usage figures, not a named customer. It now earns the In production badge.

## What is not decided

The name, whether the stage is a sum or is named from the shape, and the first sector cohort are the operator's to decide. Nothing here settles them: "Spectrum" is used as a working name and the stage is the sum.

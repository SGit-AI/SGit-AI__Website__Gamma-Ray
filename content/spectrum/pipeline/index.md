---
title: The Spectrum pipeline
summary: How a Spectrum card is made for a third party: the roles, the evidence record, what is built in this repository and what a person still does.
---
# The pipeline

## How it runs today

This is a beta and the flow is still being found. Today a card for somebody else's product goes through this, by a team of agents working in the public repository:

1. **A draft** by the studio agent: the evidence mapped to indicators, every source captured and hashed, a vault.
2. **Two rounds of review** by a reviewer agent that did not write it: every source opened and checked against the answer; then every level three and four argued against.
3. **A sign-off** by an approver agent that neither wrote nor reviewed it.
4. **Published as beta.** The company is told afterwards and invited to correct or claim its card.

The gate refuses to publish a third party's card without the two rounds and the sign-off.

{{gen:queue}}

## The fuller pipeline it is growing towards

Several agents and one person, so that no level rests on one reader.

| Step | Who | Does | Never does |
|---|---|---|---|
| 1. Scout | an agent | builds the cohort and picks one agentic product per company | publishes |
| 2. Collector | an agent | finds sources, captures and hashes each one into the card's vault, runs read-only checks of public addresses | sends credentials, or tests anything |
| 3. Assessor A and Assessor B | two agents with no shared context | each maps evidence to indicators | assigns a level |
| 4. Scorer | code, not an agent | computes levels, stage, badges and the constellation from the indicators both assessors agree on | judges |
| 5. Challenger | an agent | argues against every level three and four, and every disagreement between the assessors | lowers a level by itself: what it cannot settle goes to a person |
| 6. Gate | code | checks the rules mechanically | |
| 7. Editor | an agent | writes the standout lines and the edition | uses an adjective about a company |
| 8. A person | | approves the cohort, settles what the challenger escalates, signs off, and sends anything that leaves | |

## The evidence record

One per answer, in the card's vault and in [evidence.json](../../data/evidence.json):

| Field | What it is |
|---|---|
| `indicator` | the one fact this is evidence for |
| `url` | the public source |
| `sha256`, `read_at` | the hash of what was fetched and when: the level was computed from that capture, not from the page as it may be today |
| `method` | `read` (a person or agent read it) or `probe` (an address was fetched and it resolved) |
| `span` | the words quoted, fewer than fifteen |
| `grade`, `mode` | how it is known, and whether it holds as shipped or is available |
| `assessor`, `agreement`, `challenger` | who mapped it, whether both agreed, and what the challenger found |

## What exists in this repository

- **The scorer:** `build/spectrum.mjs`, run on every build over `data/spectrum.json`.
- **The collector's capture step:** `tools/capture.mjs` fetches every source of a scan once, saves it into the vault and records its SHA-256. All sources of the first five cards were captured this way.
- **The gate:** `build/validate.mjs` checks every answer has a public source, a grade and a mode, that a quoted span is under fifteen words, and that no card is published below level one.
- **The outputs:** [cards.json](../../data/cards.json) and [evidence.json](../../data/evidence.json), for other sites to link to. A card is corrected in place, so link to it; do not copy it.

## What does not exist yet

- **Two blind assessors have not run, and are not required yet** (the operator, 10 November 2026: this is a beta and the flow is being discovered). The first five cards were mapped by one agent; the three product examples are in the review queue above.
- **No scout and no cohort.** No third-party company has a card.
- **Quoted spans** are recorded for some answers, not all.
- **A person's sign-off** is not yet a recorded step.

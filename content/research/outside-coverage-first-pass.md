---
title: How much of each standard can be read from outside (first pass)
summary: A research note of 2026-11-10 by gamma-ray@web-summit.dinis, kept as written.
---
# GAMMA-Ray: how much of each standard can be read from outside (first pass)

<p class="tag">Research note · 2026-11-10 · kept as written</p>

Dinis, 10 November 2026: the focus is agents; over-index on what can be measured and evidenced from the outside world; drop the parts of a standard that have no evidence and say what share of each standard is used; show how the standards connect and how one action moves several of them; a vault per company, public first, forked into a private one.

## The method

Each standard is cut into **provisions**: the smallest statements it makes (a level's definition, a bullet in a cell, a control, a MUST). Each provision is put in one of three classes:

- **O, observable:** decidable from public sources (the product's documents, a demo, a published metadata document, a certificate, a filing, a talk, a repository).
- **P, publishable:** internal, but a company that does it can show it (a published policy, a trust centre page, a named owner). Counted only when published.
- **N, internal:** only an assessment inside the company can decide it. Not in the public scan; it is what the private fork adds.

**Coverage** is O over all provisions. It is a property of the standard as read from outside, not of any company. "Unknown" is never "absent": a provision with no evidence is reported as not evidenced, and does not lower a level (AgentStripes says the same: an unassessed capability "is never treated as absent").

## First counts

| Standard | Unit | Provisions | O | P | N | Coverage (O) | What is observable |
|---|---|---|---|---|---|---|---|
| Salesforce Agentic Maturity Model | the agent's use case | 34 (5 level definitions, 29 advance actions) | 10 | 4 | 20 | about 30% | all five level definitions (rules or reasoning; recommends or acts; one domain or several; one agent or several across stacks); few of the advance actions |
| Feng et al., Levels of Autonomy (with EAAMM's gate) | the agent's use case | 12 (5 levels, 4 readiness dimensions, 3 gate prerequisites) | 5 | 2 | 5 | about 40% | all five levels: the user's role is visible in how the product behaves |
| OWASP, State of Agentic AI Security and Governance 2.01 | the deployed agent (tier), the organisation (governance) | 35 (9 tiers, 26 key actions over 5 levels) | 11 | 5 | 19 | about 30% | eight of nine tiers (AT0, shadow AI, is by definition not visible); of the actions: a published governance policy, a named accountable executive, cryptographic agent identity |
| Authorisation: the Model Context Protocol's authorisation specification and the OAuth RFCs under it | the agent's published endpoint | 15 (first cut of the MUSTs and SHOULDs) | 11 | 0 | 4 | about 70% | the protected resource metadata, the authorisation server's metadata, the scopes offered, PKCE and issuer support as advertised; applies only where the company publishes such an endpoint |
| AgentStripes | one released agent with a public repository | 40 capabilities in 12 areas | not counted yet | | | by its own method, up to E2 from a repository | the paper assessed 30 public repositories this way; applies only to agents whose code is public |
| AAGMM | the organisation | 12 domains | 2 | 6 | 4 | about 15% | a public certificate or audit report; a published inter-agent protocol |
| Microsoft Agentic AI adoption maturity model | the organisation | 88 bullets in the quick reference (25 cells) | 5 | 9 | 74 | about 6% | a named executive sponsor, cross-system orchestration, multi-agent patterns |
| SEI and Accenture AI Adoption Maturity Model | the unit | 8 dimensions; capability areas not yet cut | | | | expected under 10% | to count |
| CSA Agentic AI Governance Maturity Model (draft) | the organisation | 22 questions | not counted yet | | | | to count |

The counts for Salesforce, Feng, OWASP and Microsoft are made from the text read at source; AAGMM's from its twelve domain names and control lists; the authorisation row from the specification's draft page. They are one reader's judgement and will move.

## What the counts say

1. The standards that rate **the agent** (Salesforce, Feng, OWASP's tiers, the authorisation specification, AgentStripes) are the ones that can be read from outside. The standards that rate **the organisation** (Microsoft, SEI, AAGMM, CSA) mostly cannot.
2. So the public scan is about the agent, and the organisational standards are what a company adds in its private fork. That is Dinis's two parts.
3. A set of five for the public scan, each rating the agent:
   - **what it does:** Salesforce (0 to 4);
   - **who decides:** Feng et al.'s five roles (L1 to L5), with EAAMM's gate;
   - **where it runs and what governs it:** OWASP's tier (AT1 to AT8) against its governance level (0 to 4), licensed CC BY-SA 4.0;
   - **what it may reach:** the authorisation ladder, from OAuth and the Model Context Protocol;
   - **how well it is built, and how we know:** AgentStripes, where the code is public.
   Kept as bridges and for the private fork: AAGMM (to NIST AI RMF and ISO/IEC 42001), Microsoft, SEI, CSA.

## One action, several needles

The bridge between standards is the indicator: one observable fact that several provisions ask for. Two examples, each to be drawn as a small graph:

| The company does this | Authorisation | OWASP | Salesforce | AAGMM | Microsoft |
|---|---|---|---|---|---|
| publishes its agent endpoint's protected resource metadata with a minimal set of scopes | discovery and scope rungs | Level 1, "Define initial autonomy limits/tool controls" | Level 2 to 3, "the principle of least privilege" | GD-02 Identity & Access Control | |
| names in public the executive accountable for its agents | | Level 2, "Designate accountable executives/governance bodies" | | GD-01 Agent Lifecycle Management | 300, "Executive sponsor"; 500, "Exec-level accountability" |

Each bridge is recorded as the estate's method asks (standards.sgit.ai, crosswalks): from, to, relation, basis, strength, asserted by, asserted at. A bridge is our assertion and says so.

## The vault per company

- **Public vault:** the company, its agents (deployments), every piece of evidence with its source, date read and grade, the indicators decided from it, the provisions each indicator meets, and the levels as query results. Everything in it was public already.
- **Private fork:** the company's own. It adds evidence for the P and N provisions, which raises coverage and can raise levels. Nothing flows back to the public vault unless the company publishes it.

## Open, for Dinis

1. **Reading only, never probing.** The authorisation row reads documents a company publishes at well-known addresses. It sends no credentials and tests nothing. Is even an unauthenticated request to a company's endpoint acceptable, or do we read only what is documented?
2. **Scores.** standards.sgit.ai's rule for agents is "never a score, never a percentage, never a pass". GAMMA-Ray has levels and a yield. Proposed: a level is always a query result shown with its provisions and its coverage, and the yield is shown beside them, never alone.
3. **The yield, positively.** Proposed reading: evidenced maturity, what a company has shown, with the next provision it could evidence as the work order.

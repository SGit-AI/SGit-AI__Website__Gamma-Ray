---
title: The standards, checked at source, and what to add
summary: A research note of 2026-11-09 by gamma-ray@web-summit.dinis, kept as written.
---
# GAMMA-Ray: the standards, checked at source, and what to add

<p class="tag">Research note · 2026-11-09 · kept as written</p>

Every source below was fetched and read on 9 November 2026. "Measurable from outside" means: can a level be decided from public evidence, without the company answering a questionnaire.

## 1. The five in the brief

| Standard | Source read | What it really is | Measurable from outside | Weakness |
|---|---|---|---|---|
| Salesforce Agentic Maturity Model | https://www.salesforce.com/news/stories/agentic-maturity-model/ | A news story of 10 April 2025: five levels, 0 to 4, each with "what it is", one example and a list of "how to advance" actions | Yes, fairly: recommend or act, one domain or many, one agent or many are visible in product documents and demos | A vendor's article with no rubric; the advance lists are advice, not tests |
| Microsoft Agentic AI adoption maturity model | https://learn.microsoft.com/en-us/agents/adoption-maturity-model/ | Five levels (100 Initial, 200 Repeatable, 300 Defined, 400 Capable, 500 Efficient) by five pillars, with a cell of characteristics for each; based on CMM | Poorly: most cells describe internal practice (sponsors, operating models, culture) | A self-assessment; refers to Microsoft products; pillar names differ from the brief's (they are "Business strategy" and "AI governance and security") |
| SEI and Accenture AI Adoption Maturity Model | https://www.sei.cmu.edu/documents/6413/AI-Maturity-Model-Overview.pdf (released 8 June 2026) | Eight dimensions, five levels (Exploratory, Implemented, Aligned, Scaled, Future Ready AI), assessed per "unit", piloted with large companies | Poorly: needs an assessment inside the organisation | About AI adoption in general, not agents; the public PDF is an overview |
| EAAMM | https://www.icaimt.com/2026/agentic-ai.html (Emelyanov, 22 April 2026) | One table of five levels inside a conference paper; the levels are Feng et al.'s five user roles (arXiv 2506.12469) plus four readiness dimensions | The human's role is observable per deployment | One author; a convenience sample of 136 who rated themselves; the paper calls it "an empirically informed diagnostic framework rather than a statistically validated predictive model" |
| AAGMM | https://arxiv.org/html/2604.16338 (Acharya, v1, 13 March 2026) | Five levels (Ad-hoc, Reactive, Defined, Managed, Optimized), twelve domains mapped to NIST AI RMF and ISO/IEC 42001, a list of active controls per level | Partly: a registry, a policy, an ISO 42001 certificate can be public; most controls are internal | One independent author; validated by 750 simulation runs only; licence CC BY-NC-ND 4.0, so the text cannot be adapted or used commercially |

### Corrections to the source documents

1. **The evidence grades are not AgentStripes' grades.** AgentStripes (arXiv 2610.18603) grades one released agent from its repository: E0 "Could not be assessed", E1 "Documentation", E2 "Code or configuration", E3 "The developer's runs", E4 "A suite anyone can re-run", E5 "The assessor's sandbox or an independent review", with credits 0, 0.50, 0.70, 0.85, 0.95, 1.00. The ladder in the standards document (claim, marketing, press, primary source, artefact, verified) is a different ladder for a different object. GAMMA-Ray needs its own, said to be modelled on AgentStripes, not taken from it.
2. **AgentStripes has the mechanism we need.** The evidence level "is not chosen by the judges; it follows from where the accepted supporting quotes are located", and weak evidence caps the result (its "proof blocker" holds an agent at two stripes when safety is only read, not shown). That is a gate by evidence, and it is the certainty Dinis asks for.
3. **EAAMM's gate** is stated once, as an example: moving from L2 to L3 "requires established data quality protocols, formal escalation procedures, and demonstrated reliability metrics on routine tasks". The primary source for the levels is Feng, McDonald and Zhang, "Levels of Autonomy for AI Agents" (arXiv 2506.12469); cite that for the levels and EAAMM for the gate.
4. **The row-by-row alignment table** (section 5 of the standards document) has no source: none of the five standards maps itself to another. It is our own assertion and must be labelled so, or replaced (see section 3).
5. **Three of the five rate the organisation, two rate the use case.** A rating "per deployment" on Microsoft, SEI or AAGMM is not what those models define.

## 2. What to add

| Candidate | Source | Why | Status |
|---|---|---|---|
| OWASP, State of Agentic AI Security and Governance v2.01 (1 June 2026) | https://genai.owasp.org/resource/state-of-agentic-ai-security-and-governance/ | Nine adoption tiers (AT0 Shadow AI to AT8 federated agents) crossed with five governance levels (0 to 4): 45 cells, each with a posture from well-governed to do-not-deploy. It is the mismatch quadrant, already published by OWASP | Read only through the Cloud Security Alliance's note of 3 July 2026; to read at source |
| CSA Agentic AI Governance Maturity Model | https://labs.cloudsecurityalliance.org/agentic/agentic-governance-maturity-model-v1/ | Five levels, seven dimensions (agent identity governance first), a 22-question self-assessment, mapped to the AI Controls Matrix (243 control objectives) | A draft of 27 March 2026 |
| The authorisation axis (the "OAuth standard") | https://modelcontextprotocol.io/specification/draft/basic/authorization ; RFC 9728, RFC 8414, RFC 8707, RFC 9207, RFC 6750 | There is no OAuth maturity model. There is something better: a protocol with MUSTs, whose facts are published at well-known URLs. A protected resource's metadata, the authorisation server's metadata and the scopes it offers can be read by anyone. The scopes are the grant, in RiskMandate's sense | To design: our own ladder, each rung a test of a public document |
| An identity maturity ladder for agents | https://cloudsecurityalliance.org/blog/2026/08/20/governing-ai-agent-identities-an-identity-maturity-model-for-ai-agents | Five levels (Untracked, Discovered, Contextualized, Right-sized, Governed) and one metric, time to revocation | A vendor's guest post on the CSA blog (Akto), not a CSA standard |
| IETF drafts on OAuth for agents | datatracker.ietf.org: draft-oauth-ai-agents-on-behalf-of-user, draft-liu-agent-operation-authorization, draft-liu-ai-agent-authorization-integration | Where the standard is going: the agent named on the consent screen and in the token | Individual drafts, none adopted; a signal, not an axis |
| RiskMandate's own | https://riskmandate.ai/abp.html , https://riskmandate.ai/ramm.html , https://riskmandate.ai/insurance.html | The Agent Behaviour Policy (mandate, grant, delta, barrier), RAMM ("maturity you compute, not claim": each level a path-pattern a query can test) and the Insurability Index (five dimensions, six levels) | Ours; RAMM is the model for how GAMMA-Ray's levels should be written |

## 3. The mashup, as the estate already says to do it

graphs.sgit.ai: "don't merge vocabularies ... keep them intact and bridge them through anchor nodes", and "classification is a query, not a judgment". riskmandate.ai/ramm.html: a level "is not a narrative claim; it's a required pattern of typed, directed paths".

So the mashup is not a table of level against level. It is:

- each standard kept whole, as its own small graph (framework, dimensions, levels, each level quoted with its source);
- between them, a layer of **indicators**: small, observable facts about a deployment or a company, each a yes, a no or an unknown, each with its evidence (for example: "the agent executes actions without a person approving each one", "the agent's scopes are published", "a named accountable executive for agents is public", "an ISO/IEC 42001 certificate is public");
- each level of each standard written as a pattern over indicators. One indicator can count towards levels in several standards: that is the bridge, and it is drawn, not asserted;
- a company's level on any standard is then a query result, and two readers with the same evidence get the same answer.

## 4. The RiskMandate reading

- The **claimed** profile: the levels the public evidence supports at face value.
- The **adjusted** profile: the same, after two discounts. First by evidence (a level is capped by the weakest evidence under it). Second by barrier, in the Agent Behaviour Policy's four kinds: none, expectation, setting, boundary. Only a boundary is a control, so a governance indicator met by a policy in prose counts as an expectation and does not bound the reach.
- The **yield** is what is left of capability once the reach that nothing bounds is taken out. The distance between claimed and adjusted is the finding, and it is RiskMandate's gap, measured.

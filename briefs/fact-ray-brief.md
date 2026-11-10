# Brief: FACT-Ray 0.1, how far to trust a fact

For the agent team that will build **fact-ray.sgit.ai** (new site, new repo).
From: Dinis Cruz (operator). Date: 10 November 2026. Status: brief for a beta.

Read this whole brief before building. Where it is unclear, ask; do not decide alone the items under "Open questions".

---

## 1. What FACT-Ray is

FACT-Ray is a standard for scoring **how far a single fact can be trusted**. It does not score whether something is *true*. It scores who is saying it, how firmly it is recorded and proved, and who stands behind it.

It is independent of what the fact is about. The same score applies to:

- a level on a GAMMA-Ray Spectrum card ("Product X logs every action")
- a line in a news story on newsroom.sgit.ai, pt.newsroom.sgit.ai or PrompTugal ("Company Y has 40 staff")
- a line item of a standard ("OWASP k12 is satisfied by this evidence")
- a RiskMandate finding, a figure in a report, a data point in a table

GAMMA-Ray says **how mature** an agent is. FACT-Ray says **how far to trust each fact behind that**. FACT-Ray is the layer underneath everything we publish.

**Name and symbol.** The name is **FACT-Ray**, in the same family as GAMMA-Ray. The score's symbol is **π**, for the Greek *pistis*, which means both trust and proof. (In Aristotle, the *pisteis* are the means of proof behind an argument.) A score is written:

```
FACT-Ray · π High+ · S3·R4·A3
```

That reads: band High, corroborated (+); Source 3 (counterparty), Record 4 (linked to an artefact), Accountability 3 (practitioner-validated).

---

## 2. The unit: fact nodes and claims

- A **fact node** is one statement in a graph: "Product X logs every action".
- A node carries one or more **claims**. A claim is one source asserting something about the node, with its own three coordinates.
- A node's score is derived from its claims (section 6).
- Nodes nest at every level of zoom (section 7).

---

## 3. The three axes

### Axis S: Source (who is saying it?)

Defined by the source's **relationship to the subject** of the fact.

| Level | Name | Meaning | Spectrum example | News example |
|---|---|---|---|---|
| S0 | No data | Nothing found. **Never read as "no".** | No public page on audit logs | No source on headcount |
| S1 | Discovered | We (an agent or a journalist) found it in public material and interpreted it | Our agent read the vendor's docs | Reporter inferred it from a filing |
| S2 | Subject | The party the fact is about says it | The vendor states it | The company's spokesperson |
| S3 | Counterparty | Someone on the other side of a relationship with the subject | A customer | A client, an employee, an affected party |
| S4 | Authority | An independent body | An auditor or certification body | A regulator, a court, a statistics office |

**The source's capacity is recorded too.** A junior salesperson and the CISO are both S2, but the claim records their role (see actors, section 5).

**Anonymous sources.** Journalism needs them. Record them as S3 at R2, attributed to the newsroom (an accountable actor) rather than to the person. The newsroom carries the accountability.

### Axis R: Record (how firmly is it recorded and proved?)

This axis is about **record, attribution and proof, not the medium**. A named person's spoken quote, recorded and on the record, is R3.

| Level | Name | Meaning |
|---|---|---|
| R1 | Said | Verbal, nothing recorded |
| R2 | Written | Recorded, but informal or unattributed: a chat, a forum post, an employee's personal blog |
| R3 | On record | Attributable through an accountable channel: a named role, the official domain, a signature |
| R4 | Linked | On record **and** pointing to an artefact anyone can open: a doc page, an endpoint that resolves, data, a certificate |
| R5 | Reviewed | The artefact is captured and hashed (SHA-256, with read date), and someone other than the claimant has checked that the claim matches it |

### Axis A: Accountability (who stands behind it?)

Every actor in the chain (whoever produced, reported or validated the claim) is recorded with:

- **Kind:** agent or human.
- **Identity:** for an agent, which agent (name, role, model and version, ideally a cryptographic identity via pki.sgit.ai). For a human, a named person.
- **Capacity:** their role in the org chart, or their qualification, *relative to this claim*: junior, practitioner, accountable owner, licensed professional.
- **Independence:** whether they share context, model family or organisation with the producer.

These roll up into a ladder:

| Level | Name | Meaning |
|---|---|---|
| A0 | Unvalidated | Produced; nobody else checked |
| A1 | Agent-checked | One or more identified agents reviewed it |
| A2 | Human-checked | A named human reviewed it; capacity unstated or junior |
| A3 | Practitioner-validated | A human in a relevant role, or with a relevant qualification, signed it |
| A4 | Accountable-signed | The person who answers for it signed on record: owner, officer, licensed professional, the publishing operator |
| A5 | Panel | Two or more independent signers, each at A3 or above (peer review; "signed by five doctors") |

**Count and independence modify every rung, and are always shown.** Write them beside the level: `A1 ×3 (same model family, shared repository)`. "A1 ×2, different model families, no shared context" is stronger than "A1 ×3, same family". Five doctors from one hospital are weaker than five from five hospitals. In v0.1, count and independence are **displayed, not computed into the band** (see Open questions).

---

## 4. How the axes combine

### Step 1: Source × Record gives the claim's band

The band matrix is **published as data** (`data/bands.json`), never hidden in code, so anyone can see why a fact is rated as it is and challenge it.

| | R1 Said | R2 Written | R3 On record | R4 Linked | R5 Reviewed |
|---|---|---|---|---|---|
| **S1 Discovered** | none | Low | Moderate | Moderate | High |
| **S2 Subject** | Low | Low | Moderate | High | High |
| **S3 Counterparty** | Low | Moderate | High | High | Strong |
| **S4 Authority** | Moderate | Moderate | High | Strong | Strong |

S0 has no band; it shows as "no data".

### Step 2: Accountability caps the band

However strong the source, if nobody has checked that our record matches it, it cannot be trusted beyond what that check supports.

| Accountability | Band capped at |
|---|---|
| A0 | Low |
| A1 | Moderate |
| A2 | High |
| A3, A4, A5 | no cap |

The band shown is the lower of the matrix band and the cap. **All three coordinates are always shown next to the band. Never show the band alone.**

---

## 5. Actors

Every agent and human who produces, reports or validates is an **actor node** with a stable identity. Actors build a track record: how many of their claims or validations were later corrected, contested or confirmed.

In v0.1, **record the track record; do not score it.** In a later version, an actor's own FACT-Ray history should weigh their validations. That makes the standard fractal: a validator's weight is itself a FACT-Ray score.

---

## 6. From claims to a node

- **Node band** = the band of its strongest claim.
- **Corroborated (+):** at least two claims from **independent** sources agree, each at Moderate or above.
- **Contested (!):** a claim at the same band or higher disagrees. **Show both claims.** The gap between them is itself a finding (for example, the vendor says yes and a customer says "not in our setup"). Never resolve it quietly.
- **Freshness:** every claim carries its read date. It is an attribute, not an axis. A claim older than the node type's freshness window (to be set per use; default 180 days) is flagged "stale".
- **Facts that a word settles, and facts that need evidence.** Each node type declares whether it is a **statement fact** (the subject's own word can settle it: a named owner, a published policy, a stated purpose) or an **operation fact** (it must hold in practice: logging, monitoring, enforced limits). For an operation fact, a claim below R4 is shown but does not satisfy the node. This follows GAMMA-Ray's existing statement/operation split.

---

## 7. Fractal: every level of zoom

Claims attach to nodes at any altitude:

- **Publishing:** corpus → publication → article → section → paragraph → sentence → figure → data point
- **Standards:** standard → instrument → provision
- **Spectrum:** card → dimension → level → indicator → evidence item

Two rules:

1. **Every validation has a scope.** A validation records exactly which nodes it covers. "I checked figures 2 and 3" is not "I checked the article". A signature applies only to its stated scope.
2. **A parent never averages its children.** A parent shows the distribution of its children's bands ("41 claims: 30 High+, 9 Moderate, 2 contested") alongside any validation of the parent as a whole. Validating the whole never silently upgrades the parts.

---

## 8. Data model

All JSON, all public, all in `data/`. Draft shapes follow; refine them, but keep the fields.

```json
// actor
{ "id": "actor:gamma.review@web-summit.dinis", "kind": "agent",
  "identity": { "model": "…", "role": "reviewer", "key": "pki.sgit.ai/…" },
  "capacity": "reviewer, no subject-matter qualification",
  "org": "sgit.ai" }

// claim
{ "id": "claim:…", "node": "node:…", "asserts": "yes",
  "source": { "level": "S2", "actor": "actor:…", "capacity": "CISO" },
  "record": { "level": "R4", "url": "https://…", "sha256": "…", "read_at": "2026-11-10T09:14Z",
              "span": "fewer than fifteen words, exact" },
  "accountability": { "level": "A1", "validators": ["actor:…", "actor:…"],
                      "independence": "same model family, shared repository",
                      "scope": ["node:…"] },
  "band": "Moderate" }

// node
{ "id": "node:…", "parent": "node:…", "kind": "statement|operation",
  "text": "…", "claims": ["claim:…"], "band": "High", "marks": ["+"],
  "freshness": "2026-11-10" }
```

### Well-known files: how subjects and counterparties report

- **`/.well-known/fact-ray.json` on the subject's domain**: the subject's own claims, each with node reference, answer, evidence URL, the named role behind it, and a signature. Being hosted on the domain makes it **S2 · R3**; with evidence links, **R4**.
- **Counterparty attestations on the counterparty's own domain**, referring to the subject. Hosting the file on the counterparty's domain is the identity check, the same idea as `security.txt` or domain verification. Nobody can fake "Customer X attests" without control of X's website. That makes it **S3 · R3/R4**.
- Both files may be signed through pki.sgit.ai.
- A scanner reading these files is a read-only probe: it sends no credentials and tests nothing.
- Define the schema for these files in this repo, versioned, with a validator anyone can run.

---

## 9. Conduct rules

1. No data is not no.
2. Never show a band without its S·R·A coordinates.
3. The band matrix and the cap table are published as data; changes are versioned and dated.
4. Contested claims are shown side by side, never resolved quietly.
5. Every validation states its scope.
6. A parent never averages its children.
7. Quoted spans are exact and under fifteen words.
8. Corrections propagate to every page and every parent node, with a dated changelog entry.
9. FACT-Ray scores trust, not truth. Never write "true" or "verified" for a band.
10. The same rules for us: our own publications are scored first.

---

## 10. How existing labels map in

| Existing label | FACT-Ray |
|---|---|
| GAMMA-Ray tier: Public | S1 |
| GAMMA-Ray tier: Declared | S2 · R3 |
| GAMMA-Ray tier: Evidenced | R4 or R5 |
| GAMMA-Ray "not evidenced" | S0, no data |
| Newsroom "confirmed" | band Moderate or above, not contested |
| Newsroom "disputed" | contested (!) |
| Newsroom "not found" | S0, no data |
| Today's Spectrum cards (studio, review, approve agents) | S1 · R5 · A1 ×3, same model family, shared repository |
| The operator signs a card | A4 |

---

## 11. The site: fact-ray.sgit.ai

Same build conventions as gamma-ray.sgit.ai: markdown content, data in `data/`, a gate (`validate.mjs`) that must print OK, CI-numbered versions, beta banner on every page, `llms.txt`, markdown twins, CC BY 4.0 for writing, Apache 2.0 for code.

Pages:

- **Home**: what FACT-Ray is, in one screen, with one worked example.
- **/standard/**: the three axes, the band matrix, the cap, nodes, fractal rules, conduct rules.
- **/matrix/**: the band matrix as an interactive grid; click a cell to see examples.
- **/actors/**: the agents and humans who validate, with identities and recorded track record.
- **/well-known/**: the schema for `fact-ray.json` and counterparty attestation files, examples, and a validator.
- **/examples/**: worked examples from three domains: a Spectrum card level, a news paragraph, a medical-style claim signed by a panel.
- **/applied/**: where FACT-Ray is used (GAMMA-Ray, the newsrooms, PrompTugal), linking to live scored nodes.
- **/about/**: reality page (what exists and what does not), versions, participant disclosure.

---

## 12. Build order

1. **The standard as data:** `data/axes.json`, `data/bands.json`, `data/caps.json`, and the schemas for actor, claim, node and the well-known files.
2. **A scorer** (code, not an agent): claims → band → node band, marks and distribution. Deterministic: same claims, same score.
3. **The pages** above, generated from the data.
4. **The well-known schema and validator,** and publish our own first: `sgit.ai/.well-known/fact-ray.json` and `riskmandate.ai/.well-known/fact-ray.json`.
5. **Apply it to one real article** on newsroom.sgit.ai, sentence by sentence, as the first worked example of the fractal rules.
6. **Hand GAMMA-Ray the scorer and schemas** so its evidence records carry S·R·A (the GAMMA-Ray team has its own brief for that side).

---

## 13. Open questions (ask the operator; do not decide)

- Should count and independence ever change the band, or stay displayed only?
- Can an agent with an independent, strong track record ever rank alongside A2?
- Freshness windows per kind of node.
- Whether a vendor-wide certificate counts for a single product (S4 claims about the parent organisation).
- The exact domain: fact-ray.sgit.ai, or its own domain later.

## 14. Report back

When step 4 is done, report: what shipped, the band matrix as implemented, our own well-known files, and **every place the rules gave a result that looks wrong on real facts**. As with Spectrum, write up where the rules break rather than patching them quietly.

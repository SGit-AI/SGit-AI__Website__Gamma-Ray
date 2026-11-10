# Brief 2: Spectrum corrections, provision anchors, and FACT-Ray

For the GAMMA-Ray agent team (gamma-ray.sgit.ai, repo SGit-AI__Website__Gamma-Ray, branch `dev`).
From: Dinis Cruz (operator). Date: 10 November 2026. Follows `briefs/spectrum-0.1.md`.

This brief comes from a review of v0.0.36. The work so far is good: the findings page, the review rounds and the published reasoning are exactly the point. This brief does four things:

1. Corrects four Spectrum rules that broke on real evidence.
2. Makes every standard's line item a real, linkable anchor where evidence lands.
3. Adds trust to every evidence item, using the new FACT-Ray standard.
4. Opens the doors for companies and their customers to report, and changes the outreach.

A companion brief, `FACT-RAY-BRIEF.md`, defines FACT-Ray. Read section 3 and section 4 of it before part 3 here.

---

## Part 1. Spectrum rule corrections

Each of these came from the findings page or from reading the computed cards. Apply them, re-score every card, and record each change in the findings page with the before and after signatures.

### 1.1 Close the Autonomy hole

**Problem.** Claude Code on the web and GitHub Copilot cloud agent score A0, because S1 (in production) was removed and nothing catches an agent that acts below L3. An agent that plainly acts reads as less than a chat assistant.

**Change.**
- **A3 Acts** = I08 plus one of I17–I19. S1 is no longer part of A3.
- **S1 becomes a badge: "In production".** It is earned when a public source names a customer, or gives usage figures, *for the capability that acts* (sessions, tasks, pull requests; not install or seat counts, as round two of the claude-code-local review argued).
- A4 is unchanged except that it now builds on the new A3.

### 1.2 No zeros on a card

**Problem.** Signatures read "A0 · C0 · O0", which breaks the rule that a dimension with no evidence reads "not yet evidenced", never zero.

**Change.** Render an unevidenced dimension as a dash in the signature (`A– · R2 · C2 · O1`) and as "not yet evidenced" in the card body. In `cards.json`, use `null`, not `0`. The stage sum treats a dash as 0, but the card never prints 0.

### 1.3 Make Reach L3 reachable

**Problem.** All ten cards, published and draft, sit at R2. R3 needs I14 (agents talking to agents) or I24 (published authorisation metadata), which almost nobody has yet. The dimension does not tell anyone apart.

**Change.** Add indicator **S4 "Exposes an agent interface"**: the product publishes an interface that other agents can call. That means a published MCP server, an A2A agent card, or an API documented for agent use, each checked by a read-only probe or a vendor doc page.
- **R3 Open protocol** = one of I14, I24 or S4, plus I25.
- S4 needs signed provision links like every other indicator (MCP Authorization items and OWASP inventory items are the likely first ones).

### 1.4 Fix Openness L1 for products that don't chat

**Problem.** Replit, Manus and AISLE score O0 because I56 ("tells the people it talks to that it is an AI") was written for chatbots.

**Change.** **O1 Disclosed** = I20 plus one of I56, I22 or I58.

### 1.5 One reading to keep

The findings page reads Autonomy and Reach as "the highest rule met" and Control and Openness as cumulative. Keep that, and state it on the evidence-map page.

---

## Part 2. Every line item of every standard becomes an anchor

**Problem.** `data/provisions.json` holds the full text of all 279 provisions, but **no page shows them**: a provision ID such as `owasp.k12` appears nowhere in the built site, and **none of the 279 has a link to its place in the source document**. The matrix and the constellation count links, but nobody can follow one. The operator could not find the connection to the actual line items.

This matters more than it looks. **The line item of the standard is where the evidence actually lives.** Indicators are the shortcut on top; provisions are the ground.

### Build

1. **A stable anchor per provision.** `/provisions/<id>/` (or an anchor on the instrument's page), showing:
   - the provision's text, as in `provisions.json`
   - `source_url`: a deep link to the exact section of the source document (new field; fill it for all 279, and record when a source has no deeper link than the document)
   - every indicator that cites it, with the relation (same, part, absence) and the signed assertion (who linked it, when, with a written basis)
   - every evidence item, on every card, that reaches it, with that evidence's FACT-Ray score (Part 3)
2. **Evidence records cite provisions directly.** Each record in `evidence.json` gains a `provisions` list: `[{ "id": "owasp.k12", "relation": "same" }, { "id": "aiact.art-14", "relation": "part" }]`. Fill it from the indicator's links; it can be overridden per record with a reason.
3. **The relation decides how much credit flows.** A "same" link carries the evidence fully to the provision. A "part" link marks the provision as partly evidenced and says what is missing. An "absence" link points the other way. "Touched never means complies" now holds at the level of each line item.
4. **A clickable constellation.** On each card, "41 provisions lit" opens the exact 41 line items, each traced back to the evidence that lit it.
5. **The 70 provisions no question reaches** get anchors too. A company can answer them directly through its well-known file (Part 4), so they finally have a way to count.

---

## Part 3. Trust on every evidence item (FACT-Ray)

Spectrum says how mature a product is. FACT-Ray says how far to trust each fact behind a level. Integrate it as follows.

1. **Every evidence item gets S·R·A coordinates and a π band,** computed with the FACT-Ray scorer and band table (take them from the FACT-Ray repo as soon as they exist; until then, implement the tables in its brief exactly and mark them provisional).
2. **Record the actors.** Every studio, review and approve step names its actor. Today's cards are **S1 · R5 · A1 ×3 (same model family, shared repository)**: discovered by an agent, captured and hashed, checked by two other agents, no human. Show that honestly on each card. It tells a company exactly what "beta" means.
3. **The operator's sign-off is a recorded step.** When Dinis signs a card, its evidence moves to A4 for the scope he signs. Record the scope.
4. **Show trust beside maturity, never mixed into it.** Each level on a card shows the strongest π band of the evidence that met it. **Trust never lowers a level.** It says how firmly the level stands.
5. **Card status follows trust:** **Draft** (discovered, agent-reviewed) → **Confirmed** (the company has confirmed or corrected it, on record) → **Attested** (at least one customer has gone on record). Print the status on the card.
6. **Statement facts and operation facts.** GAMMA-Ray's existing split carries over: an operation fact (logging, monitoring, enforced limits) needs evidence at R4 or above to satisfy its indicator. A company's word alone (R3) settles only statement facts.

---

## Part 4. Doors for companies and customers, and new outreach

1. **Read the well-known files.** The scanner fetches `/.well-known/fact-ray.json` from each subject's domain, and counterparty attestation files from customers' domains, using the FACT-Ray schema. The file can answer **per indicator or per provision**. Companies that already self-assess against OWASP, NIST AI RMF or an ISO/IEC 42001 statement of applicability can reuse that work directly. We roll provision answers up to indicators and levels.
2. **The outreach asks two parties at once:**
   - **To the company:** "Here are the facts we found about your product. Confirm or correct each one, or publish this file."
   - **To a customer:** "Will you go on the record about how you use it, in a narrow, factual statement (in production, which configuration, since when)?" This is a statement of use, not an endorsement.
   Update the claim notes and outreach drafts in `studio/outreach/` to make both asks.
3. **Dogfood first.**
   - Publish `riskmandate.ai/.well-known/fact-ray.json` and correct, in public, the items the RiskMandate Publisher card gets wrong.
   - The team are customers of several of the products scanned. For the products the team actually uses, publish counterparty attestations from sgit.ai. Label them as participant entries.
4. **Portuguese companies see their card privately first.** Rule 4 (publish as beta, then tell the company) stays for large vendors. For the Portuguese companies met at Web Summit, show the draft card privately and invite confirmation before it is published. The relationship is the point.

---

## Part 5. Deadline and order

Web Summit stand: **Thursday 12 November**.

By Thursday, in this order:

1. Part 1 (rule corrections) applied, all cards re-scored, findings page updated.
2. Part 2 steps 1 and 4: provision anchors with text and source links, and the clickable constellation. Fill `source_url` for as many of the 279 as possible, starting with OWASP, the EU AI Act and NIST.
3. Part 3 steps 2 and 5: actors recorded, and the Draft status printed on every card.
4. Draft cards for 8–10 Portuguese agentic companies (seed from the pt.newsroom.sgit.ai graph and the Web Summit company map), shared privately.

After Thursday: the rest of Part 2 and Part 3, Part 4, then the first PrompTugal edition.

## Report back

Report: the re-scored signatures (before and after each rule change), how many provisions have a source link, the Portuguese draft cards, and **any rule in this brief that broke on real evidence**.

## Open (ask the operator)

- Whether "In production" should also raise the stage, or stay a badge only.
- Whether a vendor-wide certificate counts for one product.
- Which first sector cohort for PrompTugal.

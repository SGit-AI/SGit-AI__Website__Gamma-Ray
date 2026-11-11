# What exists

A thing not listed here does not exist. (site v0.0.173)

## Exists

- **A team and a workflow** (`team/README.md`): a draft, two rounds of review, a sign-off, then published as beta; enforced by the gate. The sessions were started on 10 November 2026; what each has done is in `team/log.md`.
- **A feedback lane:** `/feedback/` seals a message in the browser and appends it to a write-only lane. Tested once by its maker. Read by one agent's session key, so it is read only while that session lives.

- **Spectrum 0.2, in beta:** the public front door. Sixteen level rules as data, a deterministic scorer, five cards (our two agents and three products), an evidence map, a pipeline page and a page of what the rules did on real evidence. `cards.json` and `evidence.json` for other sites to link to. Spectrum 0.2 applies the four corrections of `briefs/gamma-ray-brief-2.md` part 1 (Acts without production use, which is now the In production badge; a dash and `null` instead of a zero; a new indicator `S4` that opens Reach three; Openness one for products that do not chat). Every scan was scored again; the before and after are in `data/history/spectrum-0.1.json` and `spectrum-0.2.json` and on `/spectrum/findings/`. No scan has been read for `S4` yet.
- **Captured evidence:** every source of the five scans fetched once, saved in the scan's vault and hashed; the hashes are in the scan data.

- **A standard in beta, 0.2:** two ladders (freedom 1 to 5, governance 0 to 4), the level held, three tiers of evidence, rules for which answers count, and seven rules of conduct. Written by one agent with its operator. Reviewed once from outside, by an AI model at the operator's request; the review's findings are applied.
- **The mashup as data:** the provisions of eight instruments, the indicators, the questions and the links between them, in `data/` (the counts are computed on the mashup page). Every provision was taken from its source; every link is one reader's first pass.
- **Computed pages:** the questions, the graph, the coverage of each instrument by tier, and the outliers, all generated from the data.
- **Two scans of our own agents**, at the Public tier, each answer with its source.
- **Three example ratings of products** (Claude Code on a machine, Claude Code on the web, GitHub Copilot cloud agent), each per configuration, from its vendor's documentation, not seen by the vendor.
- **A label** for each rating, a page that walks through how a rating is made, and a replay table of what moved when the rules changed.
- **A beta banner** on every page and a beta mark on every label.
- **The lens:** RiskMandate's capability grammar, barriers and evidence grades, copied from abp.sgit.ai. A measured grant for three of the five scans, and a delta for one.
- **A public vault for every scan**, with its read key on the scan's page.
- **This site:** built by CI on every push, with a version only CI writes, a gate, a markdown twin for every page and an llms.txt.

## Does not exist

- **One third party's card has been signed off:** Replit Agent passed two rounds of review and a sign-off and is published as beta. The others are in review (the state of each scan is on `/spectrum/pipeline/`); the three examples that were live before the workflow stay published while they are reviewed.
- **No card for any company in a cohort.** No scout has run and no cohort is approved.
- **FACT-Ray 0.1, provisional, inside this site** (`/fact-ray/`): the three axes, the band matrix and the cap table as data, a deterministic scorer, the actors, three worked examples (one live from a card, two illustrative), a schema and a validator for `/.well-known/fact-ray.json`, and this site's own file at that address. Every fact behind a published card is a node with one claim (`data/fact-ray/nodes.json`), and every record in `evidence.json` carries its coordinates and the provisions it reaches.
- **Trust on every card:** each level shows the strongest band of the facts behind it, each card shows the distribution of its facts, the chain of actors and its status. Every card is **Draft**: found and checked by agents of one model family in one repository; no human has signed one; no company has confirmed one; no customer has attested one.
- **A page for every provision** (`/provisions/<id>/`): its text, its place in the source, the indicators that cite it with the kind of link, and the evidence on every published card that reaches it. The NIST, AI Act and MCP provisions have an address deeper than their document (the count is on `/provisions/`); the others link to the document, because its publisher gives no deeper address. The AI Act anchors were not checked by fetch. Each card lists the exact provisions it lights.
- **Every published card as a graph** (`/spectrum/graph/`, `data/graphs/<id>.json`): card, dimensions, levels, facts, evidence, pages, actors, provisions and instruments, joined by verbs with named inverses, with each open question as a node. Made at build time from what the scorers computed; it scores nothing. The cards are not joined into one graph yet.
- **The flow from a stand to a card** (`/flow/`, `data/flow.json`): twelve steps, who does each (a person, an agent, code), what it leaves on record and the trust after it. **A field agent**, `gamma.field@web-summit.dinis` (since 10 November 2026, 13:00 UTC), takes companies met at Web Summit from intake (`data/intake/`) to a draft card. Two intakes exist (Pebl, Bind Flow); neither has a card yet.
- **Three Spectrum decisions are open** and are the operator's: the name, stage by sum or by shape, the first cohort. From the second brief, also open: whether In production raises the stage, and whether a vendor-wide certificate counts for one product.

- **No scan of anybody's deployment but our own.** No organisation has been rated. No vendor has been asked or shown anything; the product examples say so.
- **No grant measured by us.** The grants shown were measured or derived by the Agent Behaviour Policy project; one of them (Claude Code on a machine) is derived, not measured.
- **No check of the links.** Nobody, person or model, has checked the links between indicators and provisions one by one.
- **No questionnaire.** The Declared tier is defined; the form an operator would fill in is not built.
- **No deployment meets the rule for "bounded".** It is strict, and may be wrong.
- **No second human reader.** The outside review was by a model.
- **No authorisation ladder of our own.** The protocol's requirements are in the graph as provisions; a ladder with rungs is not written.
- **No map** of many agents, and no published score of anybody.
- **Not read at source yet:** Feng, McDonald and Zhang's paper on levels of autonomy; ISO/IEC 42001 and 27001 (cited nowhere as text); the Cloud Security Alliance's draft model in full; the X-ray work this is meant to sit beside.
- **No crosswalk review.** Each link records what kind it is, but not yet a written basis or a strength.
- **Nothing in PrompTugal.news** uses this yet.

## FACT-Ray: what does not exist yet

- No company or customer has published a well-known file. The reader (`tools/fact-ray.mjs read <domain> --save`) and the build can put a company's claims beside a card's facts as second claims (a scan names its `domain`); it has run only on a test. Claims about provisions are not rolled up to indicators, and a customer's file is not read into a card.
- Signatures on well-known files are in the schema and are not checked.
- The files for riskmandate.ai and promptugal.news are drafts on this site (`/fact-ray/well-known/drafts/`); they are not hosted on those domains.
- No real news article is scored yet. The news and panel examples are illustrative.
- Actors have no cryptographic identity recorded and no model version; their track record is counted from the scans, not scored.
- Written bases exist only for the links of the four Spectrum indicators; the other links are asserted in the mapping without one.
- FACT-Ray has no site of its own.

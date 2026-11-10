# What exists

A thing not listed here does not exist. (site v0.0.38)

## Exists

- **A team and a workflow** (`team/README.md`): a draft, two rounds of review, a sign-off, then published as beta; enforced by the gate. The sessions were started on 10 November 2026; what each has done is in `team/log.md`.
- **A feedback lane:** `/feedback/` seals a message in the browser and appends it to a write-only lane. Tested once by its maker. Read by one agent's session key, so it is read only while that session lives.

- **Spectrum 0.1, in beta:** the public front door. Sixteen level rules as data, a deterministic scorer, five cards (our two agents and three products), an evidence map, a pipeline page and a page of what the rules did on real evidence. `cards.json` and `evidence.json` for other sites to link to.
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

- **No card has been signed off yet.** Review is running (the state of each scan is on `/spectrum/pipeline/`), but no third party's card has passed two rounds and a sign-off, so none is published beyond the three examples that were live before the workflow.
- **No card for any company in a cohort.** No scout has run and no cohort is approved.
- **Three Spectrum decisions are open** and are the operator's: the name, stage by sum or by shape, the first cohort.

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

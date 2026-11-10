---
title: The standard
summary: GAMMA-Ray draft 0.1: what is rated, the questions, the three tiers of evidence, the two ladders (freedom and governance), the level held, and the rules that keep it fair.
---
# The standard

<p class="tag">Draft 0.1 · for argument, not for use</p>

## The premise

The more constrained, controlled and governed an agent is, the more it can be trusted, and the faster its owner can let it go. Governance is not the brake on an agent's freedom. It is what clears it.

## What is rated

One **agent in one deployment**: a team of agents or a workflow, as it runs for somebody. Not a company. A company's picture is the set of its agents.

A **product** can be scanned too, as its vendor documents it, but a product is not a deployment: it has no owner, no policy and no mandate until somebody runs it. A product scan shows a starting point, what the product does and controls as shipped and what it can when its options are on, and is labelled as an example.

## What is said, and what it can do

The questions measure what is said about an agent. Its **grant**, what its permissions let it do, is measured separately, in RiskMandate's terms, and the difference between the two is the **delta**. [The lens](../lens/index.md) says how the two halves meet.

## The three layers

1. **Provisions.** Every instrument is cut into its smallest statements: a level's definition, a bullet, a control, a requirement, an article. Each is quoted, or cited where its licence does not allow quoting, with its source.
2. **Indicators.** One observable fact about an agent, answered yes with evidence, or left as not evidenced. An indicator cites every provision that asks for that fact.
3. **Questions.** A small number of plain questions, each a group of indicators.

A link from an indicator to a provision says what kind it is: the **same** thing, a **part** of what the provision asks, or its **absence** (some instruments describe their lowest level by what is missing). Every link is our assertion. No instrument here maps itself to another.

## The tiers

The same questions are answered at three tiers. Each tier adds indicators, and so adds coverage of each instrument.

| Tier | Answers come from | The operator takes part | How the answer is shown |
|---|---|---|---|
| **Public** | what is online: product pages, documents, demos, published metadata, certificates, filings, repositories | no | observed |
| **Declared** | a short questionnaire the operator answers | yes | declared: a claim, shown as a claim |
| **Evidenced** | documents and records the operator shares, or a live scan | yes | evidenced |

Of the {{n:indicators}} indicators, {{n:publicIndicators}} can be answered at the Public tier, {{n:declaredIndicators}} need the operator's word, and {{n:evidencedIndicators}} need the operator's evidence. A declared answer is never counted as an observed one.

## Freedom: what the agent does on its own

{{gen:freedom-table}}

The level names are ours. The questions behind them cite Salesforce's five levels, the five user roles used by EAAMM, and OWASP's adoption tiers; those levels can be read off the same answers.

## Governance: how it is controlled

{{gen:governance-table}}

The ladder follows RiskMandate's four kinds of barrier: nothing, a rule in prose, a setting, and a boundary enforced outside the agent's own reach. Only the last is a control, so level 3 asks for it. Where a grant has been measured, level 3 reads it from the grant and not from words.

## As shipped, and available

Each answer says how it holds: **in this deployment**, **as shipped** (true of a product out of the box), or **available** (a control or a mode the operator can turn on). The level held counts the first two. What the third would add is shown beside it, as the level the agent could be held at.

## The level held

Each governance level clears freedom up to a level. An agent is **held** at the lower of the freedom it reaches and the freedom its governance clears.

- **Level reached** minus **level held** is the gap.
- The level held is the **Risk-Adjusted Yield**: the part of an agent's freedom that its governance supports.
- The first missing piece of evidence for the next governance level is the **work order**.

Two instruments say the same in their own terms. EAAMM states that its level 3 comes with "formal governance required". OWASP's matrix gives, for each adoption tier, the governance level at which it is adequate. The table of what each level clears is ours, and a draft.

## The rules

1. **No answer without evidence.** Each yes links to its source, with the date it was read and how it is known.
2. **Not evidenced is not no.** An indicator with no evidence is reported as such and never lowers a level by itself; it only fails to raise one.
3. **Levels are computed.** A level is a stated pattern over indicators. Two readers with the same evidence get the same level.
4. **Never one number alone.** The level held is always shown with the level reached, the governance level and the evidence.
5. **Reading only.** A Public scan reads what an operator has published. It sends no credentials and tests nothing.
6. **Deployments are shown to their operator first; products are examples.** A scan of a named organisation's deployment is not published before that organisation has seen it and been invited to correct it. A product may be scanned as an example, from its vendor's own documentation and published profiles only, labelled as not seen by the vendor, and corrected on request.
7. **Every bridge is signed.** A link between an indicator and a provision records what it is, who asserted it and when.

## Open

- The level rules are a first draft and coarse: an agent built on a code-executing assistant that works with other agents reaches level 5 quickly.
- The links have been made by one reader. A second reader, and a second model, have not checked them.
- Each answer carries a grade (documented, self-reported, observed and so on), but the grade does not yet change a level.
- How much of the governance ladder should be read from the measured grant is open; today it is two indicators.

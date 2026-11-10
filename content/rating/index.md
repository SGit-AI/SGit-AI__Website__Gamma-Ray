---
title: How a rating is made
summary: A GAMMA-Ray rating step by step, with one worked example, the label it produces, the configurations of a product, and what changed in the rules between versions.
---
# How a rating is made

<p class="tag">Standard {{n:standardVersion}} · published for review · every rating here is experimental</p>

A GAMMA-Ray rating is a public reading of public evidence, in the tradition of the public ratings of websites' encryption and of companies' security posture: every input is linked, the rules are published, and anyone can check the arithmetic or correct a fact.

## The label

This is what a rating looks like when it is shown somewhere else. One for each of the {{n:scans}} scans so far:

{{gen:labels}}

- **The large number** is the level the agent is **held at**: the freedom its evidenced governance supports. For a product it is the range of freedom across its configurations, because a product is not held at anything until it is deployed.
- **The lines beside it** are never left off: what it reaches, its governance, its grant, and what is on its work order.
- **Beta rating** stays on the label until the standard leaves beta.

## The steps, on one example

The example is RiskMandate Publisher, one of our own agents, because its grant and its mandate are both published.

**1. Say what is being rated.** One agent in one deployment. For a product, which configuration.

**2. Answer the questions.** {{n:questions}} questions, {{n:indicators}} indicators. Each answer is a yes with a source, the date read, and how it is known. No evidence means "not evidenced", never "no".

{{fig:profile:riskmandate-publisher}}

**3. Decide which answers count.** A fact is one of two kinds:

- a **statement fact**: publishing it is the evidence. A purpose written down, an owner named, a policy published.
- an **operation fact**: it has to be true while the agent runs. These count only when they are observed or measured. If they are only stated, they are shown as **claimed** and do not raise a level.

There are {{n:operationFacts}} operation facts:

{{gen:operation-facts}}

Some other facts have a scope note, so that a near miss is not credited:

{{gen:scoped}}

**4. Compute freedom.** From the first five questions: what it is built on, whether it acts, how far it reaches, whether it works with other agents, and the person's role. The Publisher reaches level 5.

**5. Measure the grant.** What its permissions actually let it do, capability by capability, with the barrier in front of each. This is RiskMandate's measurement.

{{fig:grant:riskmandate-publisher}}

**6. Compute governance.** Each level is a pattern over the indicators. Two of them are read from the measured grant and never from words: that the grant is enumerated, and that every capability whose effect cannot be undone is behind a boundary.

{{gen:governance-table}}

**7. Hold the level.** The agent is held at the lower of the freedom it reaches and the freedom its governance clears.

{{fig:quadrant:riskmandate-publisher}}

The filled dot is what the evidence supports. The hollow dot is where the agent's own statements would put it.

**8. Write the work order.** Most consequential first: capabilities the mandate refuses that are in the grant anyway; capabilities that cannot be undone and are not bounded; then the evidence the next level is missing.

**9. Issue the label, and put everything in a vault.** The rating, its evidence list and its grant go into a public vault whose read key is on the rating's page.

## The deployment matters: the matrix

The same product is a different agent depending on how it is set up. So a product is rated per configuration, and it gets no governance level: that belongs to whoever deploys it.

{{gen:product-list}}

{{gen:matrix}}

The deployments rated so far:

{{gen:scan-list}}

## What changed from the last version, and what moved

The rules changed after an outside review of site v0.0.2. Three changes:

1. **Evidence has to be eligible.** Operation facts count only when observed or measured.
2. **A boundary has a scope.** One bounded capability no longer satisfies "bounded". Every capability that cannot be undone has to be behind a boundary, read from a measured grant.
3. **A product has no governance level.** It has configurations.

Four answers in the product examples were wrong and were removed or corrected. All {{n:scans}} scans were then replayed:

{{gen:moved}}

## What a rating is not

- Not a certification, an audit or a security review.
- Not a judgement of a vendor. A product example says what the product does and controls as documented.
- Not final. This is a beta. The mapping behind the questions has had one reader, the level rules are a draft, and a rating will move when they do.

To correct a fact in a rating, the page of each rating names its sources; the repository is public.

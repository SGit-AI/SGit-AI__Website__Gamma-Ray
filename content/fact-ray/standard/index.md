---
title: The FACT-Ray standard
summary: The three axes of FACT-Ray, the band matrix, the cap, fact nodes and claims, the rules of zoom and the conduct rules.
---
# The standard

<p class="tag">FACT-Ray {{gen:fr-version}} · built inside GAMMA-Ray first; it will move to its own site</p>

## The unit: fact nodes and claims

- A **fact node** is one statement: "Product X logs every action".
- A node carries one or more **claims**. A claim is one source asserting something about the node, with its own three coordinates.
- A node's score comes from its claims.
- Nodes nest at every level of zoom.

## Axis S: Source. Who is saying it?

Defined by the source's relationship to the subject of the fact. The source's capacity is recorded too: a junior salesperson and the CISO are both S2, and the claim records their role.

{{gen:fr-axis-s}}

**Anonymous sources.** Journalism needs them. They are recorded as S3 at R2, attributed to the newsroom rather than to the person. The newsroom carries the accountability.

## Axis R: Record. How firmly is it recorded and proved?

This axis is about record, attribution and proof, not the medium. A named person's spoken quote, recorded and on the record, is R3.

{{gen:fr-axis-r}}

## Axis A: Accountability. Who stands behind it?

Every actor in the chain is recorded with a kind (agent or human), an identity, a capacity relative to this claim, and independence from the producer. These roll up into a ladder:

{{gen:fr-axis-a}}

**Count and independence are always shown** beside the level: `A1 ×3 (same model family, shared repository)`. In this version they are displayed and do not change the band.

## How the axes combine

**Step 1: Source by Record gives the claim's band.** The matrix is data ([bands.json](@@/data/fact-ray/bands.json)), never hidden in code.

{{gen:fr-matrix-md}}

S0 has no band; it shows as "no data".

**Step 2: Accountability caps the band.** ([caps.json](@@/data/fact-ray/caps.json))

{{gen:fr-caps}}

The band shown is the lower of the matrix band and the cap. All three coordinates are always shown next to the band.

## From claims to a node

- **The node's band** is the band of its strongest claim.
{{gen:fr-marks}}
- **Freshness** is an attribute, not an axis. Every claim carries its read date.
- **Statement facts and operation facts.** A statement fact can be settled by the subject's own word: a named owner, a published policy, a stated purpose. An operation fact has to hold in practice: logging, monitoring, enforced limits. For an operation fact, a claim below R4 is shown and does not satisfy the node.

## Every level of zoom

Claims attach to nodes at any altitude: a corpus, a publication, an article, a sentence, a figure; a standard, an instrument, a provision; a card, a dimension, a level, an indicator, an evidence item. Two rules:

1. **Every validation has a scope.** "I checked figures 2 and 3" is not "I checked the article". A signature applies only to its stated scope.
2. **A parent never averages its children.** A parent shows the distribution of its children's bands, beside any validation of the parent as a whole. Validating the whole never upgrades the parts.

## Conduct rules

{{gen:fr-rules}}

## How GAMMA-Ray's labels map in

| GAMMA-Ray | FACT-Ray |
|---|---|
| Tier: public | S1 |
| Tier: declared | S2 · R3 |
| Tier: evidenced | R4 or R5 |
| Not evidenced | S0, no data |
| Today's Spectrum cards (studio, review and approve agents) | S1 · R5 · A1, same model family, shared repository |
| The operator signs a card | A4, for the scope he signs |

## Not decided

These are the operator's: whether count and independence should ever change the band; whether an agent with a strong independent track record can rank beside A2; freshness windows per kind of node; whether a vendor-wide certificate counts for one product; the domain FACT-Ray moves to.


[The standard](@@/fact-ray/standard/index.md) · [The matrix](@@/fact-ray/matrix/index.md) · [The actors](@@/fact-ray/actors/index.md) · [Well-known files](@@/fact-ray/well-known/index.md) · [Examples](@@/fact-ray/examples/index.md) · [Where it is applied](@@/fact-ray/applied/index.md)

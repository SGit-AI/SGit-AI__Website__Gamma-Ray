---
title: FACT-Ray
summary: FACT-Ray scores how far one fact can be trusted: who says it, how firmly it is recorded, and who stands behind it. Trust, not truth.
---
# FACT-Ray: how far to trust a fact

<p class="tag">FACT-Ray {{gen:fr-version}} · built inside GAMMA-Ray first; it will move to its own site</p>

GAMMA-Ray says how mature an agent is. **FACT-Ray says how far to trust each fact behind that.** It does not say whether a fact is true. It says who is saying it, how firmly it is recorded and proved, and who stands behind it.

A score is written with its three coordinates, always:

<p class="fr-score">FACT-Ray · π High+ · S3·R4·A3</p>

That reads: band High, corroborated (+); Source 3 (a counterparty, such as a customer), Record 4 (linked to an artefact anyone can open), Accountability 3 (validated by a practitioner). The symbol π is for the Greek *pistis*, which means both trust and proof.

- **Source:** who is saying it? We found it (1), the subject says it (2), a counterparty says it (3), an independent authority says it (4).
- **Record:** how firmly is it recorded? From said (1) to captured, hashed and checked by someone else (5).
- **Accountability:** who stands behind it? From nobody (0) to a panel of independent signers (5).

Source and Record give a band from a [published matrix](@@/fact-ray/matrix/index.md). Accountability caps it: however strong the source, a record nobody has checked cannot be trusted beyond what that check supports.

## One worked example, live

{{gen:fr-home-example}}

That is what "beta" means on every card on this site today, said exactly: found by an agent, captured and hashed, checked by other agents of the same family, no human. It is also why the strongest thing a company can do is say it on its own website.

## The strongest claim is on your own website

A company answers for itself by publishing one file at a known address on its own domain: `/.well-known/fact-ray.json`. Hosting it there is the identity check, the same idea as `security.txt`. Its claims are read at Source 2 at once, and a customer's file on the customer's own domain is read at Source 3. [The schema, examples and a validator](@@/fact-ray/well-known/index.md).

## The same rules for us

Our own publications are scored first. This site publishes [its own file](@@/fact-ray/well-known/index.md), and [every published card](@@/fact-ray/applied/index.md) carries the trust of the facts behind it.


[The standard](@@/fact-ray/standard/index.md) · [The matrix](@@/fact-ray/matrix/index.md) · [The actors](@@/fact-ray/actors/index.md) · [Well-known files](@@/fact-ray/well-known/index.md) · [Examples](@@/fact-ray/examples/index.md) · [Where it is applied](@@/fact-ray/applied/index.md)

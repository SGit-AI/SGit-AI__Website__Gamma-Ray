---
title: FACT-Ray well-known files
summary: How a company answers for itself: one file at /.well-known/fact-ray.json on its own domain, and a customer one on theirs. The schema, our own file, and a validator.
---
# The well-known file

<p class="tag">FACT-Ray {{gen:fr-version}} · built inside GAMMA-Ray first; it will move to its own site</p>

The strongest thing a company can say about its product, it says on its own website. One file, at one known address:

`https://<your domain>/.well-known/fact-ray.json`

- **The subject's own file** holds what the company says about its product, claim by claim, each with the role that stands behind it and, where there is one, a page anyone can open. Because it is served from the company's domain, each claim is read at **Source 2 · Record 3**; with an evidence link, **Record 4**.
- **A counterparty's file** is the same file on a customer's own domain, about the subject: a narrow statement of use (in production, which configuration, since when). It is a statement of use, not an endorsement. It is read at **Source 3**.
- Hosting the file on the domain is the identity check, as with `security.txt`. Nobody can publish "Customer X attests" without control of X's website.
- A claim can answer **an indicator** (`gamma-ray:indicator/I41`) or **a line item of a standard** (`gamma-ray:provision/owasp.k12`). A company that already assesses itself against OWASP, NIST AI RMF or ISO/IEC 42001 can reuse that work.
- Reading the file is a read-only fetch. It sends no credentials and tests nothing.

## Our own file, first

This site publishes [its own file](@@/.well-known/fact-ray.json):

{{gen:fr-own}}

How it is read today:

{{gen:fr-own-read}}

It reads low, and that is the point of showing it: a subject's word that nobody else has checked is capped. When a reviewer has checked each claim against its page, the cap lifts.

## Files for our other agents

Made from their published scans, and not hosted yet. They belong on the domains of the agents they describe:

{{gen:fr-drafts}}

## The validator

```
node tools/fact-ray.mjs validate <file or https address>
node tools/fact-ray.mjs read <domain>
```

Both are in [the repository](https://github.com/SGit-AI/SGit-AI__Website__Gamma-Ray/blob/dev/tools/fact-ray.mjs), with no dependencies. `read` fetches the file from the domain, checks it, and prints each claim with the coordinates it is read at.

## The schema (0.1)

Also at [well-known.schema.json](@@/data/fact-ray/schemas/well-known.schema.json), with the schemas for an [actor](@@/data/fact-ray/schemas/actor.schema.json), a [claim](@@/data/fact-ray/schemas/claim.schema.json) and a [node](@@/data/fact-ray/schemas/node.schema.json).

{{gen:fr-schema}}

## Not built yet

A signature over the file (through pki.sgit.ai) is in the schema and is not checked yet. The scanner does not yet read these files into the cards: a claim found in one is not yet a second claim on a card's fact.


[The standard](@@/fact-ray/standard/index.md) · [The matrix](@@/fact-ray/matrix/index.md) · [The actors](@@/fact-ray/actors/index.md) · [Well-known files](@@/fact-ray/well-known/index.md) · [Examples](@@/fact-ray/examples/index.md) · [Where it is applied](@@/fact-ray/applied/index.md)

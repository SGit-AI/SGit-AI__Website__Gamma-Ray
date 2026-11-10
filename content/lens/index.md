---
title: The lens: mandate, grant and delta
summary: How RiskMandate's measurement sits in GAMMA-Ray. The questions measure what is said about an agent; the grant measures what its permissions let it do; the delta is the difference.
---
# The lens: mandate, grant, delta

RiskMandate is not one of the instruments GAMMA-Ray maps. It is how GAMMA-Ray measures.

## Two halves

Most of what the questions ask is about what is **said**: what an agent is for, what its rules are, who answers for it, which controls it has. Those answers are true on paper. Some depend on context, and some are only an intention.

The other half is what the agent **can do**: the permissions it was actually given. That is a different kind of fact. It is measured on the deployment, capability by capability, and it changes when a token, a scope or a setting changes.

| RiskMandate's object | What it is | Where GAMMA-Ray gets it |
|---|---|---|
| **The mandate** | what the agent is authorised and expected to do | the questions, mostly at the Public and Declared tiers |
| **The grant** | everything the agent can do | a measured profile of the deployment, in the capability grammar below |
| **The delta** | excess where it can and nobody asked; shortfall where it was asked and cannot | derived from the two, never written by hand |
| **The barrier** | what stands between the agent and each capability | recorded per capability: nothing, a rule in prose, a setting, a boundary |

## How the grant changes a level

Two indicators are read from the grant whenever one has been measured, and not from anybody's description:

- **the grant is enumerated**: there is a profile;
- **it is bounded**: every capability that cannot be undone sits behind a boundary.

Both are needed for governance level 3, and neither can be met by a description. "Bounded" has a scope: **every capability in the grant whose effect cannot be undone** has to sit behind a boundary. A proxy on the network does not bound a push to a repository.

The grant also writes the top of the work order: a capability the mandate refuses that is in the grant anyway comes first, then the capabilities that cannot be undone and are not bounded.

Beyond that, the grant is **counted and shown, never scored**: how many capabilities, how many behind a boundary, and, where a mandate is written, how many in excess.

## The capability grammar

{{n:capabilities}} capabilities, each a verb, an object and a reach. Copied from the Agent Behaviour Policy project's published vocabulary ([abp.sgit.ai](https://abp.sgit.ai/data/index.json), version {{n:lensVersion}}, CC BY 4.0), not adapted.

{{gen:lens-capabilities}}

## The barriers

{{gen:lens-barriers}}

The test, in the project's words: "A control bounds a grant only if it is enforced by something the grant does not include."

## How an answer is known

Every answer and every grant row carries a grade, in the same project's vocabulary, weakest first:

{{gen:lens-evidence}}

## The questions that belong to the lens

{{n:lens}} indicators ask directly for one of RiskMandate's objects:

{{gen:lens-indicators}}

## Limits

- A grant profile describes a deployment shape. Its publisher states that it is not an assessment, an audit or a review of any named product and carries no score. GAMMA-Ray counts its rows and says where they came from; the levels are GAMMA-Ray's own.
- Of the {{n:scans}} scans here, not all have a measured grant, and only one has a published mandate to compute a delta against.

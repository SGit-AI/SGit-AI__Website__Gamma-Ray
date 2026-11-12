---
title: GAMMA-Ray: how much an AI agent does on its own, and how well that is governed
summary: A draft standard that rates an AI agent on two things, its freedom and its governance, from evidence, by joining the public maturity standards into one short list of questions.
---
<p class="eyebrow">A standard in beta, published for review · Graph-Analyzed Multi-framework Maturity Assessment with Risk-Adjusted Yield</p>

# What an agent can do, how openly it shows it, and how far it can be trusted to go.

<p class="lede">GAMMA-Ray reads the public evidence about an agentic product and turns it into a card: four dimensions, four levels, every level computed from a published rule and backed by the standards it touches.</p>

{{gen:spectrum-cards}}

**New here?** [The briefing](briefing/index.md) is two minutes on a phone. · [FACT-Ray: how far to trust each fact](fact-ray/index.md) · [How the Spectrum card works](spectrum/index.md) · [the evidence map](spectrum/evidence-map/index.md) · [what the rules did on real evidence](spectrum/findings/index.md)

## How the standard works: questions, mapped to the standards

Maturity standards for agents ask many of the same things in different words. We cut {{n:standards}} instruments into {{n:provisions}} provisions, one statement each, found the observable fact behind each (an **indicator**), and grouped those facts into **questions**. {{n:linked}} of the {{n:provisions}} provisions ({{n:linkedPct}}) are reached by {{n:questions}} questions. That mapping is the standard: every level on a card is a query over it, and every answer counts towards several standards at once.

**From hundreds of statements to a short list of questions.**

{{fig:funnel}}

**Every question, every indicator, every provision.** Questions on the left, the indicators they are asked as in the middle, the provisions of each instrument on the right. Hover a question to see what one answer reaches; click it to pin it and move around; click again to open it. Every dot is a link to the line item in its standard.

{{fig:homegraph}}

**One answer, many standards.** Each cell is the number of provisions of that instrument that one question reaches.

{{fig:matrix}}

**How the standards connect.** Two instruments are joined when one indicator cites both.

{{fig:homering}}

[All {{n:questions}} questions, with every citation](questions/index.md) · [the mashup, with what would not compress](mashup/index.md) · [every provision, with its place in the source](provisions/index.md)

## Underneath: the rating

The card is the front door. Behind it is the governance reading, written for whoever operates an agent: **the more an agent is governed, the further it can be trusted to go.**

GAMMA-Ray rates one AI agent on two things: how much it does on its own, and how well that is controlled. It asks {{n:questions}} questions. Each answer needs evidence, and each answer counts towards several published standards at once.

<div class="stats"><div><b>{{n:standards}}</b><span>instruments read at source</span></div><div><b>{{n:provisions}}</b><span>provisions, one statement each</span></div><div><b>{{n:indicators}}</b><span>indicators, one observable fact each</span></div><div><b>{{n:questions}}</b><span>questions</span></div></div>

## Two levels, one result

**Freedom** is what the agent does on its own, from 1 (it answers) to 5 (agents working with agents). **Governance** is how it is controlled, from 0 (nothing stated) to 4 (proven). An agent is **held** at the highest freedom level that its governance supports. A small agent that is well governed is mature. A powerful one that nobody can show to be controlled is not, yet.

{{gen:labels}}

{{fig:quadrant}}

The questions measure what is said about an agent. What its permissions actually let it do, its **grant**, is measured separately, with [RiskMandate](https://riskmandate.ai/)'s lens: mandate, grant, and the delta between them. [How the two halves meet](lens/index.md).

## Read more

- [How a rating is made](rating/index.md): the steps on one example, the label, and the matrix of configurations.
- [The standard](standard/index.md): the levels, the tiers and the rules.
- [The questions](questions/index.md): all {{n:questions}}, with every citation.
- [The mashup](mashup/index.md): the graph, and what would not compress.
- [Coverage](coverage/index.md): how much of each instrument can be read from outside.
- [The lens](lens/index.md): mandate, grant and delta, and how the grant changes a level.
- [Scans](scans/index.md): our own agents, and {{n:products}} products as examples.

## Where this is

A beta, site {{n:version}}, standard {{n:standardVersion}}. Every rating is experimental. The mapping between instruments is a first pass by one reader and has not been checked by a second. It rates {{n:deployments}} of our own agents, and shows {{n:products}} products as examples from their vendors' documentation. [What exists and what does not](about/reality.md).

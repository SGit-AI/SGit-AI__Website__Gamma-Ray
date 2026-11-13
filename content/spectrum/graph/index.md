---
title: Every card is a graph
summary: Each Spectrum card as one graph, from the card down to the sentence on a public page and across to the line items of the standards, in the grammar of Fractal Semantic Graphs.
---
# Every card is a graph

A level on a card means nothing alone. It means something because of what it connects to: the facts it rests on, the evidence behind each fact, the page that evidence was read on, the people and agents who checked it, and the line items of the standards the fact speaks to. Everything above inherits from what is below it.

This follows [Fractal Semantic Graphs: Meaning Through Connectivity](https://graphs.sgit.ai/v2/books/fsg/index.html): every edge is a verb with a named inverse, there is no generic "relates to", an absence is a node, and every piece of evidence carries the words it came from. The grammar is the same at every zoom. The vocabulary changes with the altitude: a card speaks of dimensions and levels, a standard of provisions, evidence of pages and hashes.

## What each level rests on

Open a dimension, then a fact: the path goes from the card down to the words on a public page, and across to the line items of the standards.

{{fig:paths:riskmandate-publisher}}

## The same path, read aloud

{{gen:graph-walk}}

If a path does not read as a sentence, the edge is wrong.

## The verbs

{{gen:graph-verbs}}

Two of these verbs are from the book's fifteen. The others are ours, named for this domain, and are open to correction. The data: [verbs.json](@@/data/graphs/verbs.json).

## The graphs

{{gen:graph-cards}}

An open question ("not yet evidenced") is a node in the graph, joined to the dimension that awaits it and marked with the level it would reach. It is not a no.

## What this is not, yet

- The graphs connect what the scorers computed. They do not score anything, and the number of independent paths to a fact does not change its trust band.
- There is one graph per card. The cards are not yet joined into one graph, though they already share their provision, instrument and actor nodes by address.
- The links from a fact to a provision are our assertions; most have no written basis yet.
- Nothing here is stored in a graph database. Each graph is one JSON file made at build time.

---
title: The mashup
summary: The graph that joins the instruments: provisions, indicators and questions, how far they compress, which facts move the most instruments, and the outliers that would not compress.
---
# The mashup

## The number

{{n:provisions}} provisions in {{n:standards}} instruments come down to {{n:indicators}} indicators and {{n:questions}} questions. {{n:linked}} provisions ({{n:linkedPct}}) are reached. {{n:outliers}} are not, and are listed below.

{{fig:funnel}}

## The graph

{{fig:graph}}

## One answer, many needles

Each cell is the number of provisions of that instrument that one question reaches.

{{fig:matrix}}

{{n:shared}} of the {{n:indicators}} indicators are asked for by three or more instruments. These are the facts asked for by four or more:

{{gen:shared}}

## What would not compress

A provision is an outlier when no question reaches it. Some are about the organisation and not the agent (culture, communities, investment). Some are specific to one instrument. They are kept, because the list of what only one instrument asks is a finding.

{{gen:outliers}}

## How this was made, and its limits

- Each instrument was read at its source and cut into provisions by a script or by hand; the texts are in [provisions.json](../data/provisions.json).
- The indicators and their links were written by one reader, an AI agent, in one pass on 10 November 2026. No second reader has checked them. Expect them to move.
- "Reached" means that an indicator cites the provision, sometimes only in part. It does not mean that a yes to the question satisfies the provision.
- Microsoft's 88 items are the bullets of its quick reference as the page served them; some sit in a different column from the one their wording suggests.

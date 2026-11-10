---
title: One question set, many standards, tiers that add coverage (shape for debate)
summary: A research note of 2026-11-10 by gamma-ray@web-summit.dinis, kept as written.
---
# GAMMA-Ray Public: one question set, many standards, tiers that add coverage (shape for debate)

<p class="tag">Research note · 2026-11-10 · kept as written</p>

Dinis, 10 November 2026: a first pass that includes everything that can be evidenced online, from a normal description of the product and its agents, and from what a simple questionnaire surfaces; called GAMMA-Ray light or public, one of several GAMMA-Rays; a mashup that says which share of each standard it uses; wider instruments (NIST, GDPR, ISO 27000) added item by item; other levels need access to the company; the result is a list of questions, close to a vendor risk assessment or a due diligence report primed for public information.

## The object: a question

GAMMA-Ray is a set of questions about one agent. Each question:

- is answered yes, no or not evidenced, never by opinion;
- says where its answer may come from (the tier, below);
- cites the provisions it answers, in as many instruments as ask for it. That list of citations is the mashup, and it is how one answer moves several standards.

A wider instrument adds citations to a question; it adds a new question only when that question is about the agent and can be decided. That keeps the set short and about agents, and stops it becoming a general supplier questionnaire.

## The tiers

| Tier | Where answers come from | Who is involved | Grade of the evidence |
|---|---|---|---|
| **Public** | what is online: product pages, documents, demos, published metadata, certificates, filings, talks, repositories | nobody at the company | observed |
| **Declared** | the same questions, plus those only the company can answer, in a short questionnaire | the company answers | declared: a claim, shown as a claim |
| **Evidenced** | documents the company shares in its private fork | the company shares | evidenced |
| **Verified** | a live scan (X-ray) or an independent review | the company takes part | verified |

Each tier adds questions and so adds coverage of each standard. A declared answer never counts as an observed one.

## A first dozen questions (Public tier, draft)

| # | Question | Decided from | Moves |
|---|---|---|---|
| 1 | What is the agent built on: a vendor's assistant, a platform with the company's data, a low-code builder, a code-executing agent, a custom build? | product documents | OWASP adoption tier AT1 to AT5 |
| 2 | Does it connect to third-party tools across a trust boundary (for example Model Context Protocol servers, plugins)? | documents, published endpoints | OWASP AT6; Salesforce 2 to 3 |
| 3 | Does it only retrieve and recommend, or does it execute actions? | documents, demo | Salesforce 1 or 2; Feng L2 or L3 |
| 4 | In one domain's data, or across several? | documents | Salesforce 2 or 3 |
| 5 | Do several agents coordinate, inside the company or across companies? | documents, published protocols | Salesforce 4; OWASP AT7, AT8; AAGMM GD-09 |
| 6 | What is the person's role: operates, approves each action, is consulted on exceptions, approves only critical decisions, observes? | documents, demo | Feng L1 to L5; OWASP Level 2 (human in the loop); AAGMM GD-06 |
| 7 | Does the agent say it is an AI to the people it talks to? | the product itself | EU AI Act, Article 50 |
| 8 | Is the agent's authorisation published: resource metadata, authorisation server, scopes? | well-known documents | authorisation ladder; AAGMM GD-02; OWASP Level 1 (tool controls) |
| 9 | Are the scopes it asks for narrower than the whole account? | consent screen, documents | Salesforce 2 to 3 (least privilege); authorisation ladder |
| 10 | Is there a published policy on how the company governs its agents? | the company's site | OWASP Level 2; Microsoft 300; NIST AI RMF, Govern |
| 11 | Is a person named in public as accountable for them? | the company's site, filings | OWASP Level 2; Microsoft 300, 500 |
| 12 | Does the company hold a public certificate that covers the agent's service (ISO/IEC 42001, ISO/IEC 27001, an audit report)? | the certificate or the certifier's register | AAGMM GD-08; ISO/IEC 42001; ISO/IEC 27001 |

Every citation in the last column is to be checked against the instrument's text and recorded as a bridge with its basis, before any of this is called the standard.

## What the tiers say about each standard

The coverage table becomes one row per standard and one column per tier: for example "Public reads about 30% of OWASP; Declared adds about 25%; Evidenced the rest". The Public column is the first pass of 10 November; the others are to count.

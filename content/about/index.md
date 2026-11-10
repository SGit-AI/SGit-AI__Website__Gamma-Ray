---
title: About GAMMA-Ray
summary: What GAMMA-Ray is, the name, how it sits beside RiskMandate and X-ray, and how this site is built.
---
# About

## The name

**GAMMA-Ray** is Graph-Analyzed Multi-framework Maturity Assessment with Risk-Adjusted Yield.

- **Graph-Analyzed:** provisions, indicators and questions are a graph, and every level is the result of a query over it.
- **Multi-framework:** several instruments, each kept whole.
- **Maturity Assessment:** where an agent sits, from evidence.
- **Risk-Adjusted Yield:** the part of an agent's freedom that its governance supports.

## The family

- **RiskMandate** supplies [the lens](../lens/index.md): what an agent was authorised to do, what it can reach, the difference, and what stands in the way. It measures the grant; it is not one of the mapped instruments.
- **X-ray** is the quick live scan of one agent with its operator present. It answers the same questions at the Evidenced tier.
- **GAMMA-Ray Public** is the scan from public evidence alone.
- Scans compose into the **map**: many agents on the quadrant.

## A vault for every scan

Each scan is kept in an encrypted vault that holds the agent's evidence, the answers and the levels. The vault of a Public scan is public: its read key is published beside the scan. An operator can fork it into a private vault and add what only they hold.

## How this site is built

- Plain files and Node, no dependencies. `content/` and `data/` are the source; pages are generated and never committed.
- Every page has a markdown twin at the same address with `.md`, and the site has an [llms.txt](../llms.txt).
- The version on every page is written by the CI pipeline on every push, and by nothing else. [Versions](versions.md).
- A gate checks every build: every link in the graph resolves, every answer in a scan has a source, every page has its twin.

[Who is behind this](participant.md) · [What exists](reality.md) · [The brief](brief.md) · [Research notes](../research/index.md)

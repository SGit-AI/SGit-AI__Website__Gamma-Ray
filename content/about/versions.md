---
title: Versions
summary: Every release of this site. The CI pipeline numbers a release on every push and writes this record; nothing else does.
---
# Versions

This site is at **{{n:version}}**. On every push the CI pipeline runs the gate, takes the next number, writes it, builds, commits the release as `site vX.Y.Z` and deploys. Nobody edits the number by hand.

{{gen:versions}}

#!/usr/bin/env bash
# CI owns the version (https://newsroom.sgit.ai/articles/ci-owns-the-version.html). Adapted from the PrompTugal.news
# site's newsroom/build/tag_release.sh. Run only by .github/workflows/deploy-pages.yml on a push: takes the next
# number (patch on dev, minor on main), writes build/version.txt, the row in data/versions.json and REALITY.md's
# version, builds, runs the gate, commits "site vX.Y.Z: <subject>" as GitHub Actions, tags and pushes.
set -euo pipefail
BRANCH=${BRANCH:?BRANCH must be dev or main}
PUSH=${PUSH:-1}
git config user.name 'GitHub Actions'; git config user.email 'actions@github.com'
for try in 1 2 3 4; do
  git fetch --quiet --tags origin "$BRANCH"
  git checkout -q -B "$BRANCH" "origin/$BRANCH"
  SUBJECT=$(git log -1 --format=%s)
  HEADVER=$(grep -oP '^site v\K[0-9]+\.[0-9]+\.[0-9]+(?=:)' <<< "$SUBJECT" || true)
  if [ -n "$HEADVER" ] && [ "$(git log -1 --format=%an)" = 'GitHub Actions' ]; then
    echo "the head is already a CI release ($SUBJECT); rebuilding it to deploy, no new number"
    node build/validate.mjs; exit 0
  fi
  AGENT=$(git log -1 --format=%B | grep -m1 '^Agent: ' | sed 's/^Agent: //' || true)
  LAST_TAG=$(git tag --list 'v*' | sort -V | tail -1); LAST_TAG=${LAST_TAG:-v0.0.0}
  FILE=$(cat build/version.txt 2>/dev/null || echo v0.0.0)
  LAST=$(printf '%s\n%s\n' "$LAST_TAG" "$FILE" | sort -V | tail -1)
  IFS=. read -r A B C <<< "${LAST#v}"
  if [ "$BRANCH" = main ]; then NEW="v$A.$((B + 1)).0"; else NEW="v$A.$B.$((C + 1))"; fi
  echo "newest version $LAST (tag $LAST_TAG, version.txt $FILE) -> $NEW on $BRANCH"
  printf '%s\n' "$NEW" > build/version.txt
  WHAT=$(sed -E 's/^[^ :]+@[A-Za-z0-9.-]+: //; s/^site v[0-9.]+: //' <<< "$SUBJECT")
  [ "$BRANCH" = main ] && WHAT="release: dev at ${HEADVER:-$(git rev-parse --short HEAD)} promoted to main"
  node -e '
    const fs = require("fs"), [v, what, by, from] = process.argv.slice(1)
    const rows = JSON.parse(fs.readFileSync("data/versions.json", "utf8")).filter(r => r.version !== v)
    rows.unshift({ version: v, date: new Date().toISOString().slice(0, 10), what, ...(by ? { by } : {}), ...(from ? { from } : {}) })
    fs.writeFileSync("data/versions.json", JSON.stringify(rows, null, 2) + "\n")' "$NEW" "$WHAT" "$AGENT" "$(git rev-parse --short=9 HEAD)"
  sed -i -E "s/\(site v[0-9]+\.[0-9]+\.[0-9]+\)/(site $NEW)/" REALITY.md
  node build/validate.mjs
  git add build/version.txt data/versions.json REALITY.md
  git commit -q -m "site $NEW: $WHAT" -m "Released by CI from $(git rev-parse --short HEAD) ($SUBJECT)${AGENT:+
Agent: $AGENT}"
  git tag "$NEW"
  [ "$PUSH" = 1 ] || { echo "PUSH=0: would release $NEW"; exit 0; }
  if git push -q --atomic origin "HEAD:$BRANCH" "refs/tags/$NEW"; then echo "released $NEW"; exit 0; fi
  git tag -d "$NEW" > /dev/null
  sleep $((try * 3))
  echo "$BRANCH moved, or the push was refused, while releasing; starting again from its head (attempt $try)"
done
echo "::error::$BRANCH kept moving or the push kept being refused; nothing released"; exit 1

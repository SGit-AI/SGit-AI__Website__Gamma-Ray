#!/usr/bin/env bash
# CI owns the version (https://newsroom.sgit.ai/articles/ci-owns-the-version.html). Adapted from the PrompTugal.news
# site's newsroom/build/tag_release.sh. Run only by .github/workflows/deploy-pages.yml on a push: takes the next
# number (patch on dev, minor on main), writes build/version.txt, the row in data/versions.json and REALITY.md's
# version, builds, runs the gate, commits "site vX.Y.Z: <subject>" through GitHub's API (so the commit is signed and
# shows as Verified), tags and pushes.
set -euo pipefail
BRANCH=${BRANCH:?BRANCH must be dev or main}
PUSH=${PUSH:-1}
git config user.name 'GitHub Actions'; git config user.email 'actions@github.com'
for try in 1 2 3 4; do
  git fetch --quiet --tags origin "$BRANCH"
  git reset -q --hard
  git checkout -q -B "$BRANCH" "origin/$BRANCH"
  SUBJECT=$(git log -1 --format=%s)
  HEADVER=$(grep -oP '^site v\K[0-9]+\.[0-9]+\.[0-9]+(?=:)' <<< "$SUBJECT" || true)
  if [ -n "$HEADVER" ] && [[ "$(git log -1 --format=%an)" =~ ^(GitHub Actions|github-actions\[bot\])$ ]]; then
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
  MSG="site $NEW: $WHAT"
  BODY="Released by CI from $(git rev-parse --short HEAD) ($SUBJECT)${AGENT:+
Agent: $AGENT}"
  [ "$PUSH" = 1 ] || { echo "PUSH=0: would release $NEW"; exit 0; }
  # The release commit is made through GitHub's API, so that GitHub signs it and shows it as Verified.
  # If the API refuses, fall back to a plain (unsigned) push, so that a release is never lost to this.
  OID=""
  if [ "${SIGNED:-1}" = 1 ] && command -v gh > /dev/null && [ -n "${GH_TOKEN:-}" ]; then
    node -e '
      const fs = require("fs"), [repo, branch, head, msg, body] = process.argv.slice(1)
      const additions = ["build/version.txt", "data/versions.json", "REALITY.md"].map(path => ({ path, contents: fs.readFileSync(path).toString("base64") }))
      process.stdout.write(JSON.stringify({ query: "mutation($input: CreateCommitOnBranchInput!) { createCommitOnBranch(input: $input) { commit { oid } } }",
        variables: { input: { branch: { repositoryNameWithOwner: repo, branchName: branch }, expectedHeadOid: head, message: { headline: msg, body }, fileChanges: { additions } } } }))' \
      "$GITHUB_REPOSITORY" "$BRANCH" "$(git rev-parse HEAD)" "$MSG" "$BODY" > /tmp/release-commit.json
    OID=$(gh api graphql --input /tmp/release-commit.json --jq '.data.createCommitOnBranch.commit.oid' 2> /tmp/release-commit.err || true)
    if [[ "$OID" =~ ^[0-9a-f]{40}$ ]]; then
      git fetch --quiet origin "$BRANCH"; git reset -q --soft "$OID"; git reset -q
      git tag "$NEW" "$OID"
      if git push -q origin "refs/tags/$NEW"; then echo "released $NEW (signed by GitHub, $OID)"; exit 0; fi
      echo "::warning::the release commit $OID is on $BRANCH but its tag $NEW could not be pushed"; exit 0
    fi
    echo "::warning::the signed release commit was refused ($(head -c 300 /tmp/release-commit.err)); trying a plain push"; OID=""
  fi
  git add build/version.txt data/versions.json REALITY.md
  git commit -q -m "$MSG" -m "$BODY"
  git tag "$NEW"
  if git push -q --atomic origin "HEAD:$BRANCH" "refs/tags/$NEW"; then echo "released $NEW (unsigned)"; exit 0; fi
  git tag -d "$NEW" > /dev/null
  sleep $((try * 3))
  echo "$BRANCH moved, or the push was refused, while releasing; starting again from its head (attempt $try)"
done
echo "::error::$BRANCH kept moving or the push kept being refused; nothing released"; exit 1

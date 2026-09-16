#/bin/sh

# Publish and push!
git push;
git push --tags;
# Publish under the dist-tag chosen by publish.sh: "latest" on the default
# branch, "alpha-$SHA" on any other branch. Without --tag, npm defaults every
# publish (prereleases included) to "latest", which would repoint "latest" at a
# feature-branch alpha and leak it into the v5 RC (grabthar-upgrade tracks the
# latest dist-tag).
npm publish --tag "${tag:-latest}";

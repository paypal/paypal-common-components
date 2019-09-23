#!/bin/sh

git add ./dist --all;

# Generate the changelog; adding the latest commits
./node_modules/.bin/conventional-changelog -i CHANGELOG.md -s
git add CHANGELOG.md

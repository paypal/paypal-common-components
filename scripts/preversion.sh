#!/bin/sh

set -e;

# Make sure the HEAD is clean
if ! git diff-files --quiet; then
    echo "Can not publish with unstaged uncommited changes";
    exit 1;
fi;

if ! git diff-index --quiet --cached HEAD; then
    echo "Can not publish with staged uncommited changes";
    exit 1;
fi;

# Re-install just the basics
modules='zoid post-robot zalgo-promise beaver-logger cross-domain-safe-weakmap cross-domain-utils belter grumbler-scripts @paypal/sdk-client @paypal/sdk-constants';

for module in $modules; do
    rm -rf "node_modules/$module";
done;

npm install $modules;
npm run build;

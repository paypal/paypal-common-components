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
modules='@krakenjs/zoid @krakenjs/post-robot @krakenjs/zalgo-promise @krakenjs/beaver-logger @krakenjs/cross-domain-safe-weakmap @krakenjs/cross-domain-utils @krakenjs/belter @krakenjs/grumbler-scripts @paypal/sdk-client @paypal/sdk-constants';

for module in $modules; do
    rm -rf "node_modules/$module";
done;

npm install $modules;
npm run build;

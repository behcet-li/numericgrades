#!/bin/bash

set -ex

RELEASE_DIRS="_locales html icons lib src manifest.json"

rm release*.zip

# chrome
zip -r release_chrome.zip $RELEASE_DIRS

# firefox
mkdir -p gecko
cp -r $RELEASE_DIRS gecko/
cd gecko
../tools/manifest
zip -r ../release_firefox.zip $RELEASE_DIRS
cd ..
rm -rfv gecko

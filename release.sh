#!/bin/bash

RELEASE_DIRS="_locales html icons lib src manifest.json"

echo $RELEASE_DIRS

rm release*.zip

# chrome
zip -r release_chrome.zip $RELEASE_DIRS 

# firefox
mkdir gecko
cp -r $RELEASE_DIRS gecko/
cd gecko
../tools/manifest
zip -r ../release_firefox.zip $RELEASE_DIRS
rm -rf gecko

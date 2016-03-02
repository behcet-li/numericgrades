#!/bin/bash

# chrome
rm release.zip
zip -r release_chrome.zip src icons js _locales manifest.json

# firefox
rm release_firefox.zip
mkdir gecko
cp -r src icons js _locales manifest.json gecko/
cd gecko
../tools/manifest
zip -r release_firefox.zip src icons js _locales manifest.json
mv release_firefox.zip ../
cd ..
# rm -rf gecko

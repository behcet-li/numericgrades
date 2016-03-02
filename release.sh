#!/bin/bash

rm release*.zip

# chrome
zip -r release_chrome.zip src icons js _locales manifest.json

# firefox
mkdir gecko
cp -r src icons js _locales manifest.json gecko/
cd gecko
../tools/manifest
zip -r release_firefox.zip src icons js _locales manifest.json
mv release_firefox.zip ../
cd ..
rm -rf gecko

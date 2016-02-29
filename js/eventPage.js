/* global chrome */
'use strict';

// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function () {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostContains: 'popmundo.com' },
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

var defaults = {
  numericGrades: {
    active: true,
    selected: 'grad'
  },
  progressBars: {
    active: true
  }
};

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set(defaults);
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace !== 'sync') {
    return;
  }
  var options = newValues(changes);
  publish(options);
});

function newValues (changes) {
  var parsed = {};
  Object.keys(changes).forEach(function (policyName) {
    parsed[policyName] = changes[policyName].newValue;
  });
  return parsed;
}

function publish (data) {
  data = data || {};
  chrome.tabs.query({ url: '*://*.popmundo.com/*' }, function (tabs) {
    tabs = tabs || [];
    tabs.forEach(function (tab) {
      chrome.tabs.sendMessage(tab.id, data, function () { });
    });
  });
}

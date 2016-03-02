/* global chrome */
'use strict';

var storage = chrome.storage.sync || chrome.storage.local;

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
  storage.set(defaults);
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  // firefox only supports local storage ...
  //  if (namespace !== 'sync') {
  //    return;
  //  }
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

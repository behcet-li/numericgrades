/* global chrome */
'use strict';

var storage = chrome.storage.sync || chrome.storage.local;

// Logic related to setting defaults on install or whatever
var defaults = {
  numericGrades: {
    active: true,
    selected: 'grad'
  },
  progressBars: {
    active: true
  }
};

// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Chrome_incompatibilities
if (chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(function () {
    setDefaults();
  });
}
else {
  // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime is lies
  //chrome.runtime.onStartup.addListener(function () {
  //  setDefaults();
  //});
  setDefaults();
}

function setDefaults () {
  storage.get(function (data) {
    if (!data.numericGrades || !data.progressBars) {
      storage.set(defaults);
    }
  });
}


// Logic related to publishing data to active popmundo tabs
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

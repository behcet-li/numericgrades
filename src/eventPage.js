/* global chrome */
'use strict';

function merge (target, src) {
  var array = Array.isArray(src);
  var dst = array && [] || {};

  if (array) {
    target = target || [];
    dst = dst.concat(target);
    src.forEach(function (e, i) {
      if (typeof dst[i] === 'undefined') {
        dst[i] = e;
      }
      else if (typeof e === 'object') {
        dst[i] = merge(target[i], e);
      }
      else {
        if (target.indexOf(e) === -1) {
          dst.push(e);
        }
      }
    });
  }
  else {
    if (target && typeof target === 'object') {
      Object.keys(target).forEach(function (key) {
        dst[key] = target[key];
      });
    }
    Object.keys(src).forEach(function (key) {
      if (typeof src[key] !== 'object' || !src[key]) {
        dst[key] = src[key];
      }
      else {
        if (!target[key]) {
          dst[key] = src[key];
        }
        else {
          dst[key] = merge(target[key], src[key]);
        }
      }
    });
  }
  return dst;
}

var storage = chrome.storage.sync || chrome.storage.local;

// Logic related to setting defaults on install or whatever
var defaults = {
  numericGrades: {
    active: true,
    selected: 'grad'
  },
  progressBars: {
    active: true
  },
  titlebar: {
    active: true
  },
  notifications: {
    active: true,
    interval: 10
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
    if (Object.keys(defaults).some(function (key) {
       return !data[key];
    })) {
      storage.set(merge(data, defaults));
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

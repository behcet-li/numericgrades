/* global chrome, Ractive, window, document, Templates */
'use strict';

// chrome-extension:// {{ id }} /html/options.html

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
var defaults = {
  progressBars: {
    active: true
  },
  numericGrades: {
    active: true,
    selected: 'grad'
  },
  titlebar: {
    active: true
  },
  notifications: {
    active: true
  }
};

var languageKeys = {
  'extName': '',
  'extDescription': '',
  'options_enabled': '',
  'options_numeric_grades_title': '',
  'options_numeric_grades_style': '',
  'options_numeric_grades_gradient': '',
  'options_numeric_grades_rainbow': '',
  'options_progressbars_title': '',
  'options_titlebar_title': '',
  'options_notifications_title': '',
  'options_close': ''
};

Ractive.DEBUG = false;
var ractive;

function setOptions (options) {
  if (!validateOptions()) {
    return false;
  }
  storage.set(merge(defaults, options || {}), function () {});
}

function getOptions (callback) {
  callback = callback || function () {};
  storage.get(function (options) {
    callback(merge(defaults, options || {}));
  });
}

function setup () {
  // This was done by calling `chrome.i18n.getMessage` on template BUT
  // Firefox do not honor CSP defined on manifest.json and thus blocking all
  // `new Function()` executions that are essential to any templating engine
  // when using expressions.
  // We don't have too many translation string so we can get away with
  // hardcoding key names defined in locale files and providing template
  // engines with a JSON object instead of forcing it to make function calls
  var localeMessages = {};
  Object.keys(languageKeys)
    .forEach(key => {
      localeMessages[key] = chrome.i18n.getMessage(key);
    });
  getOptions(function (options) {
    ractive = new Ractive({
      el: '#container',
      template: Templates.options,
      data: {
        local: localeMessages,
        options: options
      }
    });
    ractive.observe('options', setOptions);
    ractive.on('byebye', teardown);
  });
}

function teardown () {
  if (ractive && ractive.teardown) {
    ractive
    .teardown()
    .then(window.close)
    .catch(window.close);
  }
  setTimeout(window.close, 750);
}

// TODO: validation
function validateOptions () {
  var valid = true;
  return valid;
}

document.addEventListener('DOMContentLoaded', setup);

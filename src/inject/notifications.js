'use strict';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  options = request;
  Object.keys(request).forEach(function (option) {
    switch (option) {
      case 'titlebar':
        if (!request[option].active) {
          favicon.reset();
        }
        else {
          setBubble(lastNum);
        }
      break;
    }
  });
});

var options = {};

var s = document.createElement('script');
s.src = chrome.extension.getURL('src/inject/menuNotifications.js');
s.onload = function () {
  this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(s);

// remove all but one favicos since page has multiple
var favicos = Array.prototype.slice.call(
  document.head.querySelectorAll('[rel*="icon"]'));
favicos.shift();
favicos.forEach(function (el) { el.parentNode.removeChild(el); });

var favicon = new Favico({
  animation: 'none'
});

var lastNum = 0;

function setBubble (num) {
  lastNum = num;
  if (!num || num < 1 || options.titlebar.active !== true) {
    return favicon.reset();
  }
  favicon.badge(num);
}

function initialize_notifications () {
  document.addEventListener('count', function (e) {
    var data = e.detail || {};
    var count = data.count;
    setBubble(count);
  });

  setTimeout(function () {
    var t = document.getElementById('top-menu-notifications-num');
    if (!t) {
      return;
    }
    t = t.textContent;
    // for some fucking reason popmundo html keeps loading with 23 preset in div
    if (Number(t) === 23) {
      t = 0;
    }
    setBubble(t);
  }, 10);
}

var storage = chrome.storage.sync || chrome.storage.local;
storage.get(function (syncOpts) {
  options = syncOpts;
  initialize_notifications();
});


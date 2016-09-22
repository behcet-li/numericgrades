/* global chrome, $ */
'use strict';

var ppmrgx = /^.*:\/\/[\d]+\.popmundo.com\//;
// two minutes
var minInterval = 2 * 60 * 1000;

var options = {
  notifications: {}
};

// keeping track of chrome's focus
var inFocus = true;
chrome.windows.onFocusChanged.addListener(function (window) {
  inFocus = (window === chrome.windows.WINDOW_ID_NONE ? false : true);
});

// keeping track of last active ppm tab
var activeTab;
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (!tab.url.match(ppmrgx) || tab.active !== true) {
    return;
  }
  activeTab = tab;
});

// store when last check ran, so we don't hammer their api
var lastCheck = new Date().getTime();

// storing UID's of seen notifications so that we don't display them again
var seenNotifications = [];
function markAsRead (nots) {
  nots = Array.prototype.concat.call([], nots) || [];
  nots.forEach(function (n) {
    if (!n.UID) {
      return;
    }
    seenNotifications.push(n.UID);
  });
  // sloppy ring buffer implementation
  while (seenNotifications.length > 42) {
    seenNotifications.shift();
  }
}

// receive user triggered notification items and count
chrome.runtime.onMessage.addListener(function (request, sender) {
  if (!sender.tab || !sender.tab.url.match(ppmrgx)) {
    return;
  }
  if (request.notifications) {
    markAsRead(request.notifications);
  }
  if (request.count) {
    runNotificationsCheck();
  }
});

function runNotificationsCheck () {
  if (!options || !options.notifications || !options.notifications.active) {
    return;
  }
  if ((new Date().getTime() - lastCheck) < minInterval) {
    return;
  }
  lastCheck = new Date().getTime();
  chrome.tabs.query({ url: '*://*.popmundo.com/*' }, function (tabs) {
    tabs = tabs || [];
    if (tabs.length < 1) {
      return;
    }
    var url = tabs[0].url.match(ppmrgx);
    if (!url || !url[0]) {
      return;
    }
    url = url[0];
    // chrome is not in focus, get notifications
    if (inFocus === false) {
      return getNotifications(url);
    }
    // chrome is in focus, let's see if we're browsing ppm
    chrome.tabs.query({
      url: '*://*.popmundo.com/*',
      active: true,
      lastFocusedWindow: true
    }, function (tabs) {
      tabs = tabs || [];
      if (tabs.length < 1) {
        getNotifications(url);
      }
    });
  });
}

function getNotifications (domain) {
  $.ajax({
    type: 'POST',
    contentType: 'application/json; charset=utf-8',
    url: domain + '/WebServices/A/Open.asmx/GetMenuNotifications',
    data: '{ "ts" : "' + new Date().getTime() + '" }',
    dataType: 'json',
    success: function (msg) {
      var messages = $.parseJSON(msg.d);
      messages = messages.filter(function (message) {
        if (!message.UID) {
          return false;
        }
        return seenNotifications.indexOf(message.UID) < 0;
      });
      if (messages.length < 1) {
        return;
      }
      markAsRead(messages);
      messages = messages.map(function (message) {
        return {
          // yes thats a capital t
          title: message.Text,
          message: ''
        };
      });
      var title = messages.pop().title;
      var notificationOptions = {
        type: 'basic',
        iconUrl: '/icons/red-128.png',
        title: title,
        message: ''
      };
      if (messages.length > 0) {
        notificationOptions.type = 'list';
        notificationOptions.items = messages;
      }
      chrome.notifications.create('ppm_ng', notificationOptions);
    }
  });
}

chrome.notifications.onClicked.addListener(function (id) {
  chrome.notifications.clear(id);
  if (activeTab) {
    return focusTab(activeTab);
  }
  chrome.tabs.query({
    url: '*://*.popmundo.com/*'
  }, function (tabs) {
    focusTab(tabs.pop());
  });
});

function focusTab (tab) {
  if (!tab) {
    return;
  }
  chrome.tabs.update(tab.id, { active: true });
  chrome.windows.update(tab.windowId, { focused: true });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (sender.tab) {
    return;
  }
  if (request.notifications) {
    options = request;
  }
});

var storage = chrome.storage.sync || chrome.storage.local;
storage.get(function (syncOpts) {
  options = syncOpts;
});

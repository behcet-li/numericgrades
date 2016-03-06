/* global chrome */
'use strict';

var ppmrgx = /^.*:\/\/[\d]+\.popmundo.com\//;

// keeping track of chrome's focus
var inFocus = true;
chrome.windows.onFocusChanged.addListener(function (window) {
  inFocus = (window === chrome.windows.WINDOW_ID_NONE ? false : true);
});

// store when last check ran, so we don't hammer their 'api'
var lastCheck = new Date().getTime();

// storing UID's of seen notifications so that we don't notify them again
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

// receive user triggered notification items
chrome.runtime.onMessage.addListener(function (request, sender) {
  if (!sender.tab || !sender.tab.url.match(ppmrgx)) {
    return;
  }
  lastCheck = new Date().getTime();
  markAsRead(request.notifications);
});

// setting alarm to run periodically
chrome.alarms.create('checkNotifications', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(runNotificationsCheck);

function runNotificationsCheck (alarm) {
  if (alarm.name !== 'checkNotifications') {
    return;
  }
  if ((new Date().getTime() - lastCheck) < 2000) {
    return;
  }
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
    console.log('url', url);
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
  console.log('getting notifications from %s', domain);
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
          title: '',
          // yes thats a capital t
          message: message.Text
        };
      });
      chrome.notifications.create('ppm_ng', {
        type: 'list',
        iconUrl: '/icons/pblue6464.png',
        title: 'Popmundo',
        message: 'You have unread events',
        items: messages
      });
    }
  });
}

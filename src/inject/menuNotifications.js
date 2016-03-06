'use strict';

if (window.updateNotificationCount) {
  var originalUpdate = window.updateNotificationCount;
  window.updateNotificationCount = function (count) {
    var cEvent = new CustomEvent('count', { detail: { count: count } });
    document.dispatchEvent(cEvent);
    originalUpdate(count);
  };
}

if (window.showNotifications) {
  var originalShowNotifications = window.showNotifications;
  window.showNotifications = sendNots;
}
function sendNots (res) {
  var cEvent = new CustomEvent('notifications', { detail: { res: res } });
  document.dispatchEvent(cEvent);
  originalShowNotifications(res);
}

'use strict';

if (window.updateNotificationCount) {
  var originalUpdate = updateNotificationCount;
  window.updateNotificationCount = function (count) {
    var cEvent = new CustomEvent('count', { detail: { count: count } });
    document.dispatchEvent(cEvent);
    originalUpdate(count);
  };
}

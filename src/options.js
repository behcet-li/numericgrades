/* global chrome */
'use strict';

// chrome-extension:// {{ id }} /html/options.html

var storage = chrome.storage.sync || chrome.storage.local;

function save_options () {
  if (!validate_options()) {
    return;
  }
  var options = {
    progressBars: {},
    numericGrades: {},
    titlebar: {},
    notifications: {}
  };
  options.progressBars.active = document.getElementById('pg_active').checked;
  options.numericGrades.active = document.getElementById('ng_active').checked;
  options.numericGrades.selected = document.querySelector('#ng_select option:checked').value;
  options.titlebar.active = document.getElementById('tb_active').checked;
  options.notifications.active = document.getElementById('notifications_active').checked;
  options.notifications.interval = document.getElementById('notificatons_interval').value;
  storage.set(options, function () {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.classList.add('display');
    setTimeout(function () {
      status.classList.remove('display');
      window.close();
    }, 750);
  });
}

function restore_options () {
  storage.get(function (options) {
    options = options || {};
    document.getElementById('ng_select').value = options.numericGrades.selected;
    document.getElementById('ng_active').checked = options.numericGrades.active;
    document.getElementById('pg_active').checked = options.progressBars.active;
    document.getElementById('tb_active').checked = options.titlebar.active;
    document.getElementById('notifications_active').checked = options.notifications.active;
    document.getElementById('notifications_interval').value = options.notifications.interval;
  });
}

function validate_options () {
  var interval = document.getElementById('notifications_interval').value;
  var valid = interval.match(/^\d+$/);
  document.getElementById('save').disabled = (valid ? false : true);
  return valid;
};

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('notifications_interval').addEventListener('input', function () {
  if (!validate_options()) {
    return document.querySelector('#notifications_interval + .error')
      .classList.remove('hidden');
  }
  return document.querySelector('#notifications_interval + .error')
    .classList.add('hidden');
}, false);

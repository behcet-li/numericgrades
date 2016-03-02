/* global chrome */
'use strict';

// chrome-extension:// {{ id }} /src/page_action/page_action.html

var storage = chrome.storage.sync || chrome.storage.local;

function save_options () {
  var options = {
    progressBars: {},
    numericGrades: {}
  };
  options.progressBars.active = document.getElementById('pg_active').checked;
  options.numericGrades.active = document.getElementById('ng_active').checked;
  options.numericGrades.selected = document.querySelector('#ng_select option:checked').value;
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
    document.getElementById('ng_select').value = options.numericGrades.selected;
    document.getElementById('ng_active').checked = options.numericGrades.active;
    document.getElementById('pg_active').checked = options.progressBars.active;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

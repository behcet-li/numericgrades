/* global chrome */
'use strict';

/*
  Disclaimer:
  Majority of functionality here was salvaged from userscripts.org after I lost
  the original source code about a decade ago.
  I have reformatted the code from a mangled state and there are no comments
  to explain why things are happening this way. I have no desire to modify
  this esoteric GCC output any further since it Just Works (TM)
 */

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  options = merge(options, request);
  Object.keys(request).forEach(function (option) {
    switch (option) {
      case 'numericGrades':
        cleanupNumericGrades();
      break;
      case 'progressBars':
        cleanupProgressBars();
      break;
    }
  });
  setTimeout(function () {
    executeActive(request);
  }, 0);
});

var options = {};

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

function injectCSS (css) {
  if (css.length < 1) return;
  var heads = document.getElementsByTagName('head');
  if (heads.length > 0) {
    var node = document.createElement('style');
    node.type = 'text/css';
    node.appendChild(document.createTextNode(css));
    heads[0].appendChild(node);
  }
}

function toArray (t) {
  var arr = []; for (var i = 0; i < t.length; i++) arr.push(t[i]); return arr;
}

// progress bars
injectCSS('.PPM2_Numeric_Grades_PM_Bar { color: #000; line-height: 8px; font-size: 9px;' +
  ' font-weight: normal; font-family: "Tahoma, Geneva, sans-serif", display: inline; width: 0px; }');

// numeric grades
injectCSS('a.PPM2_Numeric_Grades + span { display: inline-block; margin-left: 5px; ' +
  'padding: 0 5px; border: 5px; font-weight: bold; border-radius: 10px; text-shadow: none; }');

injectCSS('div.plusMinusBar div.neg div { padding: 2px 3px 0 2px }');

injectCSS('div.progressBar div div, div.plusMinusBar div.pos div, ' +
  'div.plusMinusBar div.zero div, div.blueProgressBar div div, ' +
  'div.greenProgressBar div div, div.redProgressBar div div { padding: 2px 0 0 3px }');

function cleanupProgressBars () {
  Array.prototype.slice.call(document.querySelectorAll('.PPM2_Numeric_Grades_Bar'))
  .forEach(function (el) {
    el.classList.remove('PPM2_Numeric_Grades_Bar');
    var w = el.style.width;
    el.style = '';
    el.style.width = w;
    el.align = null;
    el.textContent = null;
  });

  Array.prototype.slice.call(document.querySelectorAll('.PPM2_Numeric_Grades_PM_Bar'))
  .forEach(function (el) { el.parentNode.removeChild(el); });
}

function progressBars (c) {
  c = c || document.getElementById('ppm-wrapper') || document.querySelector('div.content');
  if (!c || !c.tagName || c.tagName == 'BODY') {
    return;
  }
  var a, b, d, e, i;
  if (c.classList && c.classList.contains('progressBar')) {
    b = toArray([ c ]);
  }
  else {
    b = c.querySelectorAll('.blueProgressBar, .greenProgressBar, .progressBar');
  }
  for (i = b.length; i-- ;) {
    a = b[i],
    d = a.firstChild;
    e = !0 == /(%{0,1}[\d]+%{0,1})/i.test(a.title) ? a.title.match(/(%{0,1}[\d]+%{0,1})/i)[1] : a.title,
    (d && d.style) ? (
        d.textContent = e + '\u00a0', //nbsp
        d.align = 'right',
        d.style.lineHeight = '9px',
        d.style.fontSize = '10px',
        d.style.color = '#000',
        d.classList.add('PPM2_Numeric_Grades_Bar')
        ) : (
        a.textContent = e,
        a.style.color = '#000',
        a.classList.add('PPM2_Numeric_Grades_Bar')
    );
  }

  b = c.getElementsByClassName('plusMinusBar');
  for (i = b.length; i-- ;) {
    a = b[i];
    // we've already scored this
    if (a.getElementsByClassName('PPM2_Numeric_Grades_PM_Bar').length > 0) {
      continue;
    }
    // some edge case with missing documentation :)
    if (a.getElementsByTagName('div').length < 2) {
      continue;
    }
    // Score is already displayed by jaws or etc
    if (a.querySelectorAll('.plusMinusBar > div > div > div').length > 0) {
      continue;
    }
    e = document.createElement('div');
    e.textContent = a.title.match(/(%{0,1}-*[\d]+%{0,1})/i)[1];
    e.className = 'PPM2_Numeric_Grades_PM_Bar';
    if (0 < a.getElementsByClassName('neg').length) {
      a.childNodes[0].firstChild.appendChild(e);
      a.getElementsByClassName('posholder')[0].style.cssFloat = 'none';
    }
    else if (0 < a.getElementsByClassName('pos').length) {
      a.childNodes[1].firstChild.appendChild(e);
    }
    else {
      a.childNodes[1].firstChild.appendChild(e);
      a.childNodes[1].firstChild.style.width = '0%';
    }
  }
  return !0;
}

var dict = {
  grad: {
    name: 'Gradient',
    0: [ 'rgb(245,245,245)', 'rgb(0,0,0)' ],
    1: [ 'rgb(236,236,236)', 'rgb(0,0,0)' ],
    2: [ 'rgb(226,226,226)', 'rgb(0,0,0)' ],
    3: [ 'rgb(217,217,217)', 'rgb(0,0,0)' ],
    4: [ 'rgb(207,207,207)', 'rgb(0,0,0)' ],
    5: [ 'rgb(198,198,198)', 'rgb(0,0,0)' ],
    6: [ 'rgb(188,188,188)', 'rgb(0,0,0)' ],
    7: [ 'rgb(179,179,179)', 'rgb(0,0,0)' ],
    8: [ 'rgb(170,170,170)', 'rgb(0,0,0)' ],
    9: [ 'rgb(160,160,160)', 'rgb(0,0,0)' ],
    10: [ 'rgb(151,151,151)', 'rgb(0,0,0)' ],
    11: [ 'rgb(141,141,141)', 'rgb(255,255,255)' ],
    12: [ 'rgb(132,132,132)', 'rgb(255,255,255)' ],
    13: [ 'rgb(122,122,122)', 'rgb(255,255,255)' ],
    14: [ 'rgb(113,113,113)', 'rgb(255,255,255)' ],
    15: [ 'rgb(103,103,103)', 'rgb(255,255,255)' ],
    16: [ 'rgb(94,94,94)', 'rgb(255,255,255)' ],
    17: [ 'rgb(85,85,85)', 'rgb(255,255,255)' ],
    18: [ 'rgb(75,75,75)', 'rgb(255,255,255)' ],
    19: [ 'rgb(66,66,66)', 'rgb(255,255,255)' ],
    20: [ 'rgb(56,56,56)', 'rgb(255,255,255)' ],
    21: [ 'rgb(47,47,47)', 'rgb(255,255,255)' ],
    22: [ 'rgb(37,37,37)', 'rgb(255,255,255)' ],
    23: [ 'rgb(28,28,28)', 'rgb(255,255,255)' ],
    24: [ 'rgb(18,18,18)', 'rgb(255,255,255)' ],
    25: [ 'rgb(9,9,9)', 'rgb(255,255,255)' ],
    26: [ 'rgb(0,0,0)', 'rgb(255,255,255)' ]
  },
  rain: {
    name: 'Rainbow',
    0: [ '#ff0000', 'rgb(255,255,255)' ],
    1: [ '#ff0036', 'rgb(255,255,255)' ],
    2: [ '#ff006c', 'rgb(255,255,255)' ],
    3: [ '#ff00a2', 'rgb(255,255,255)' ],
    4: [ '#ff00d8', 'rgb(255,255,255)' ],
    5: [ '#f000ff', 'rgb(255,255,255)' ],
    6: [ '#ba00ff', 'rgb(255,255,255)' ],
    7: [ '#8400ff', 'rgb(255,255,255)' ],
    8: [ '#4e00ff', 'rgb(255,255,255)' ],
    9: [ '#1900ff', 'rgb(255,255,255)' ],
    10: [ '#001dff', 'rgb(255,255,255)' ],
    11: [ '#0053ff', 'rgb(255,255,255)' ],
    12: [ '#0089ff', 'rgb(255,255,255)' ],
    13: [ '#00bfff', 'rgb(255,255,255)' ],
    14: [ '#00f5ff', 'rgb(0,0,0)' ],
    15: [ '#00ffd3', 'rgb(0,0,0)' ],
    16: [ '#00ff9d', 'rgb(0,0,0)' ],
    17: [ '#00ff67', 'rgb(0,0,0)' ],
    18: [ '#00ff31', 'rgb(0,0,0)' ],
    19: [ '#05ff00', 'rgb(0,0,0)' ],
    20: [ '#3bff00', 'rgb(0,0,0)' ],
    21: [ '#71ff00', 'rgb(0,0,0)' ],
    22: [ '#a7ff00', 'rgb(0,0,0)' ],
    23: [ '#ddff00', 'rgb(0,0,0)' ],
    24: [ '#ffeb00', 'rgb(0,0,0)' ],
    25: [ '#ffb500', 'rgb(0,0,0)' ],
    26: [ '#ff8000', 'rgb(0,0,0)' ]
  }
};

function cleanupNumericGrades () {
  Array.prototype.slice.call(
    document.querySelectorAll('.PPM2_Numeric_Grades + span')
  ).forEach(function (el) {
    el.previousSibling.classList.remove('PPM2_Numeric_Grades');
    el.parentNode.removeChild(el);
  });
}

function numericGrades (c) {
  var selected = options.numericGrades.selected;
  c = c || document;
  var b = c.href ? Array(c) : c.querySelectorAll('a[href*="Help/Scoring/"]');
  for (var i = b.length; i--;) {
    var a = b[i];
    if (!a.classList.contains('PPM2_Numeric_Grades') && a.href.indexOf('Help/Scoring/') > -1) {
      var e = a.href.match(/\/Help\/Scoring\/(\d+)/i)[1] - 1,
      h = dict[selected][e],
      j = document.createElement('span');
      j.style.color = h[1];
      j.style.backgroundColor = h[0];
      j.textContent = ' ' + e;
      a.className = 'PPM2_Numeric_Grades';
      a.parentNode.insertBefore(j, a.nextSibling);
    }
  }
}

function initialize () {
  executeActive();

  // start listening
  var Observer = window.MutationObserver || window.WebKitMutationObserver;
  var observer = new Observer(function (records) {
    toArray(records).forEach(function (record) {
      if (!record.addedNodes) {
        return;
      }
      toArray(record.addedNodes).forEach(function (node) {
        // skipping text elements
        if (!node.tagName) {
          return;
        }
        executeActive(node);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function executeActive (node, opts) {
  if (!opts) {
    if (!node || node.nodeType) {
      opts = options;
    }
    else {
      opts = node;
      node = undefined;
    }
  }
  Object.keys(opts).forEach(function (option) {
    var settings = opts[option];
    switch (option) {
      case 'numericGrades':
        if (settings.active) {
          numericGrades(node);
        }
      break;
      case 'progressBars':
        if (settings.active) {
          progressBars(node);
        }
      break;
    }
  });
}

var storage = chrome.storage.sync || chrome.storage.local;
storage.get(function (syncOpts) {
  options = syncOpts;
  initialize();
});


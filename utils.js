/**
* @license utils.js
* Copyright (c) 2015 Florin Chelaru
* License: MIT
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
* documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
* rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
* Software.
*
* gravatarjs:  Ryan ryan@mazondo.com (MIT License)
*/


goog.provide('u.EventListener');

/**
 * @param {function(T)} callback
 * @param {Object} [thisArg]
 * @constructor
 * @template T
 */
u.EventListener = function(callback, thisArg) {
  /**
   * @type {number}
   * @private
   */
  this._id = ++u.EventListener._lastId;

  /**
   * @type {function(T)}
   * @private
   */
  this._callback = callback;

  /**
   * @type {Object|undefined}
   * @private
   */
  this._thisArg = thisArg;
};

u.EventListener._lastId = -1;

/**
 * @param {T} [args]
 */
u.EventListener.prototype.fire = function(args) {
  this._callback.call(this._thisArg, args);
};

/**
 * @type {number}
 * @name u.EventListener#id
 */
u.EventListener.prototype.id;

Object.defineProperties(u.EventListener.prototype, {
  'id': { get: /** @type {function (this:u.EventListener)} */ (function() { return this._id; })}
});


goog.provide('u.Event');

goog.require('u.EventListener');

/**
 * @param {{synchronous: (boolean|undefined), timeout: (function(Function, number, ...)|undefined)}} [options]
 * @constructor
 * @template T
 */
u.Event = function(options) {

  /**
   * @type {boolean}
   * @private
   */
  this._synchronous = options ? !!options.synchronous : false;

  /**
   * @type {number}
   * @private
   */
  this._count = 0;

  /**
   * @type {Object.<number, u.EventListener.<T>>}
   * @private
   */
  this._listeners = {};

  /**
   * Set to true when in the notify() method, to avoid infinite loops.
   * This is only used when the events are synchronous
   * @type {boolean}
   * @private
   */
  this._firing = false;

  /**
   * @type {function(Function, number, ...)}
   * @private
   */
  this._timeout = (options && options.timeout) ? options.timeout : u.Event['TIMEOUT'];
};

/**
 * @type {function(Function, number, ...)}
 */
u.Event['TIMEOUT'] = setTimeout;

/**
 * @type {boolean}
 * @name u.Event#synchronous
 */
u.Event.prototype.synchronous;

/**
 * @type {boolean}
 * @name u.Event#firing
 */
u.Event.prototype.firing;

/**
 * Gets the number of listeners register for the event
 * @type {number}
 * @name u.Event#count
 */
u.Event.prototype.count;

Object.defineProperties(u.Event.prototype, {
  'synchronous': { get: /** @type {function (this:u.Event)} */ (function() { return this._synchronous; })},
  'firing': { get: /** @type {function (this:u.Event)} */ (function() { return this._firing; })},
  'count': { get: /** @type {function (this:u.Event)} */ (function() { return this._count; })}
});

/**
 * @param {u.EventListener.<T>|function(T)} listener
 * @param {Object} [thisArg]
 * @returns {u.EventListener.<T>}
 */
u.Event.prototype.addListener = function(listener, thisArg) {
  if (typeof(listener) == 'function') {
    listener = new u.EventListener(listener, thisArg);
  }

  if (!this._listeners[listener['id']]) { ++this._count; }
  this._listeners[listener['id']] = listener;

  return listener;
};

/**
 * @param {u.EventListener.<T>} listener
 */
u.Event.prototype.removeListener = function(listener) {
  if (!this._listeners[listener['id']]) { return; }

  delete this._listeners[listener['id']];
  --this._count;
};

/**
 * @param {T} [args]
 */
u.Event.prototype.fire = function(args) {
  if (this._firing) { return; }

  var self = this;
  var timeout = this._timeout;
  var synchronous = this._synchronous;
  var doFire = function() {
    if (self._count == 0) { return; }

    self._firing = synchronous;

    u.each(self._listeners, function(id, listener) {
      if (!synchronous) {
        timeout.call(null, function() {
          listener.fire(args);
        }, 0);
      } else {
        listener.fire(args);
      }
    });
  };

  if (synchronous) {
    doFire();
  } else {
    timeout.call(null, doFire, 0);
  }

  this._firing = false;
};


goog.provide('u.log');

/**
 * @param {...} args
 */
u.log.info = function(args) {
  var verbose = u.log['VERBOSE'];
  if (verbose != 'info') { return; }

  var logger = u.log['LOGGER'] || console;
  logger.info.apply(logger, arguments);
};

/**
 * @param {...} args
 */
u.log.warn = function(args) {
  var verbose = u.log['VERBOSE'];
  if (['warn', 'info'].indexOf(verbose) < 0) { return; }

  var logger = u.log['LOGGER'] || console;
  logger.warn.apply(logger, arguments);
};

/**
 * @param {...} args
 */
u.log.error = function(args) {
  var verbose = u.log['VERBOSE'];
  if (['error', 'warn', 'info'].indexOf(verbose) < 0) { return; }

  var logger = u.log['LOGGER'] || console;
  logger.error.apply(logger, arguments);
};


goog.provide('u');

/**
 * @param {Array|Object.<number|string, *>} obj
 * @param {function((number|string), *)} callback
 * @returns {Array|Object}
 */
u.each = function(obj, callback) {
  if (obj == undefined) { return obj; }

  var i;
  if (Array.isArray(obj)) {
    for (i = 0; i < obj.length; ++i) {
      if (callback.call(obj[i], i, obj[i]) === false) { break; }
    }
  } else {
    for (i in obj) {
      if (callback.call(obj[i], i, obj[i]) === false) { break; }
    }
  }

  return obj;
};

/**
 * @param {Array.<T>|Object.<number|string, T>} obj
 * @param {function(T, (number|string|undefined)): V} callback
 * @param {Object} [thisArg]
 * @returns {Array.<V>}
 * @template T, V
 */
u.map = function(obj, callback, thisArg) {
  if (obj == undefined) { return []; }

  if (Array.isArray(obj)) { return obj.map(callback); }

  //var each = window['u']['each'];

  var ret = [];
  u.each(obj, function(k, v) {
    ret.push(callback.call(thisArg, v, k));
  });

  return ret;
};

/**
 * Makes a shallow copy of the given object or array
 * @param {Object|Array} obj
 * @returns {Object|Array}
 */
u.copy = function(obj) {
  if (obj == undefined) { return obj; }
  if (Array.isArray(obj)) { return obj.slice(); }
  var ret = {};
  u.each(obj, function(k, v) { ret[k] = v; });
  return ret;
};

/**
 * Extends the properties of dst with those of the other arguments of the function;
 * values corresponding to common keys are overriden.
 * @param {Object} dst
 * @param {...Object} src
 * @returns {Object}
 */
u.extend = function(dst, src) {
  if (arguments.length <= 1) { return dst; }
  for (var i = 1; i < arguments.length; ++i) {
    var s = arguments[i];
    for (var key in s) {
      if (!s.hasOwnProperty(key)) { continue; }
      dst[key] = s[key];
    }
  }

  return dst;
};

/**
 * @param {Array.<T>} arr
 * @param {function(T): {key: (string|number), value: *}} callback
 * @returns {Object.<(string|number), *>}
 * @template T
 */
u.mapToObject = function(arr, callback) {
  var ret = {};
  var length = arr.length;
  var v;
  for (var i = 0; i < length; ++i) {
    v = callback.apply(arr, [arr[i], i]);
    ret[v['key']] = v['value'];
  }
  return ret;
};

/**
 * @const {string}
 */
u.CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * @param {number} size
 * @returns {string}
 */
u.generatePseudoGUID = function(size) {
  var chars = u.CHARS;
  var result = '';

  for (var i = 0; i < size; ++i) {
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  }

  return result;
};

/**
 * Lightweight version of ajax GET request with minimal error handling
 * @param {string} uri
 * @returns {Promise}
 */
u.httpGet = function(uri) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', uri, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status !== 200) {
          reject('Request failed with error code ' + xhr.status);
        } else {
          resolve(xhr.responseText);
        }
      }
    };
    xhr.send();
  });
};

/**
 * @param {{uri: (string|undefined), content: (string|undefined)}} opts
 * @returns {Promise} Promise.<Object.<string, string>>
 */
u.parseLessConsts = function(opts) {
  return new Promise(function(resolve, reject) {
    if (!opts || (!opts['content'] && !opts['uri'])) { resolve({}); return; }
    if (!opts['content']) {
      u.httpGet(opts['uri'])
        .then(function(content) {
          return u.parseLessConsts({content: content});
        })
        .then(resolve);
      return;
    }

    var pairs = opts['content'].split(';')
      .filter(function(line) { return line.trim().length > 0; })
      .map(function(line) {
        return line.trim().split(':').map(function(token) { return token.trim(); })});
    var ret = {};
    pairs.forEach(function(pair) { ret[pair[0].substr(1)] = pair[1]; });
    resolve(ret);
  });
};

/**
 * Forces browser to reflow element that was previously hidden (display: none), so that transitions like
 * fade or transform can be applied to it
 * @param {HTMLElement} element
 * @returns {number}
 */
u.reflowForTransition = function(element) {
  return element.offsetWidth;
};

/**
 * @param {string} email
 * @param {{size: (string|number|undefined), rating: (string|undefined), secure: (string|boolean|undefined), backup: (string|undefined)}} [options]
 * @returns {string}
 */
u.gravatar = function(email, options) {
  // using md5() from here: http://www.myersdaily.org/joseph/javascript/md5-text.html
  function md5cycle(e, t) {
    var n = e[0], r = e[1], i = e[2], s = e[3];
    n = ff(n, r, i, s, t[0], 7, -680876936);
    s = ff(s, n, r, i, t[1], 12, -389564586);
    i = ff(i, s, n, r, t[2], 17, 606105819);
    r = ff(r, i, s, n, t[3], 22, -1044525330);
    n = ff(n, r, i, s, t[4], 7, -176418897);
    s = ff(s, n, r, i, t[5], 12, 1200080426);
    i = ff(i, s, n, r, t[6], 17, -1473231341);
    r = ff(r, i, s, n, t[7], 22, -45705983);
    n = ff(n, r, i, s, t[8], 7, 1770035416);
    s = ff(s, n, r, i, t[9], 12, -1958414417);
    i = ff(i, s, n, r, t[10], 17, -42063);
    r = ff(r, i, s, n, t[11], 22, -1990404162);
    n = ff(n, r, i, s, t[12], 7, 1804603682);
    s = ff(s, n, r, i, t[13], 12, -40341101);
    i = ff(i, s, n, r, t[14], 17, -1502002290);
    r = ff(r, i, s, n, t[15], 22, 1236535329);
    n = gg(n, r, i, s, t[1], 5, -165796510);
    s = gg(s, n, r, i, t[6], 9, -1069501632);
    i = gg(i, s, n, r, t[11], 14, 643717713);
    r = gg(r, i, s, n, t[0], 20, -373897302);
    n = gg(n, r, i, s, t[5], 5, -701558691);
    s = gg(s, n, r, i, t[10], 9, 38016083);
    i = gg(i, s, n, r, t[15], 14, -660478335);
    r = gg(r, i, s, n, t[4], 20, -405537848);
    n = gg(n, r, i, s, t[9], 5, 568446438);
    s = gg(s, n, r, i, t[14], 9, -1019803690);
    i = gg(i, s, n, r, t[3], 14, -187363961);
    r = gg(r, i, s, n, t[8], 20, 1163531501);
    n = gg(n, r, i, s, t[13], 5, -1444681467);
    s = gg(s, n, r, i, t[2], 9, -51403784);
    i = gg(i, s, n, r, t[7], 14, 1735328473);
    r = gg(r, i, s, n, t[12], 20, -1926607734);
    n = hh(n, r, i, s, t[5], 4, -378558);
    s = hh(s, n, r, i, t[8], 11, -2022574463);
    i = hh(i, s, n, r, t[11], 16, 1839030562);
    r = hh(r, i, s, n, t[14], 23, -35309556);
    n = hh(n, r, i, s, t[1], 4, -1530992060);
    s = hh(s, n, r, i, t[4], 11, 1272893353);
    i = hh(i, s, n, r, t[7], 16, -155497632);
    r = hh(r, i, s, n, t[10], 23, -1094730640);
    n = hh(n, r, i, s, t[13], 4, 681279174);
    s = hh(s, n, r, i, t[0], 11, -358537222);
    i = hh(i, s, n, r, t[3], 16, -722521979);
    r = hh(r, i, s, n, t[6], 23, 76029189);
    n = hh(n, r, i, s, t[9], 4, -640364487);
    s = hh(s, n, r, i, t[12], 11, -421815835);
    i = hh(i, s, n, r, t[15], 16, 530742520);
    r = hh(r, i, s, n, t[2], 23, -995338651);
    n = ii(n, r, i, s, t[0], 6, -198630844);
    s = ii(s, n, r, i, t[7], 10, 1126891415);
    i = ii(i, s, n, r, t[14], 15, -1416354905);
    r = ii(r, i, s, n, t[5], 21, -57434055);
    n = ii(n, r, i, s, t[12], 6, 1700485571);
    s = ii(s, n, r, i, t[3], 10, -1894986606);
    i = ii(i, s, n, r, t[10], 15, -1051523);
    r = ii(r, i, s, n, t[1], 21, -2054922799);
    n = ii(n, r, i, s, t[8], 6, 1873313359);
    s = ii(s, n, r, i, t[15], 10, -30611744);
    i = ii(i, s, n, r, t[6], 15, -1560198380);
    r = ii(r, i, s, n, t[13], 21, 1309151649);
    n = ii(n, r, i, s, t[4], 6, -145523070);
    s = ii(s, n, r, i, t[11], 10, -1120210379);
    i = ii(i, s, n, r, t[2], 15, 718787259);
    r = ii(r, i, s, n, t[9], 21, -343485551);
    e[0] = add32(n, e[0]);
    e[1] = add32(r, e[1]);
    e[2] = add32(i, e[2]);
    e[3] = add32(s, e[3])
  }

  function cmn(e, t, n, r, i, s) {
    t = add32(add32(t, e), add32(r, s));
    return add32(t << i | t >>> 32 - i, n)
  }

  function ff(e, t, n, r, i, s, o) {
    return cmn(t & n | ~t & r, e, t, i, s, o)
  }

  function gg(e, t, n, r, i, s, o) {
    return cmn(t & r | n & ~r, e, t, i, s, o)
  }

  function hh(e, t, n, r, i, s, o) {
    return cmn(t ^ n ^ r, e, t, i, s, o)
  }

  function ii(e, t, n, r, i, s, o) {
    return cmn(n ^ (t | ~r), e, t, i, s, o)
  }

  function md51(e) {
    var t = e.length, n = [1732584193, -271733879, -1732584194, 271733878], r;
    for (r = 64; r <= e.length; r += 64) {
      md5cycle(n, md5blk(e.substring(r - 64, r)))
    }
    e = e.substring(r - 64);
    var i = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (r = 0; r < e.length; r++)i[r >> 2] |= e.charCodeAt(r) << (r % 4 << 3);
    i[r >> 2] |= 128 << (r % 4 << 3);
    if (r > 55) {
      md5cycle(n, i);
      for (r = 0; r < 16; r++)i[r] = 0
    }
    i[14] = t * 8;
    md5cycle(n, i);
    return n
  }

  function md5blk(e) {
    var t = [], n;
    for (n = 0; n < 64; n += 4) {
      t[n >> 2] = e.charCodeAt(n) + (e.charCodeAt(n + 1) << 8) + (e.charCodeAt(n + 2) << 16) + (e.charCodeAt(n + 3) << 24)
    }
    return t
  }

  function rhex(e) {
    var t = "", n = 0;
    for (; n < 4; n++)t += hex_chr[e >> n * 8 + 4 & 15] + hex_chr[e >> n * 8 & 15];
    return t
  }

  function hex(e) {
    for (var t = 0; t < e.length; t++)e[t] = rhex(e[t]);
    return e.join("")
  }

  function md5(e) {
    return hex(md51(e))
  }

  function add32(e, t) {
    return e + t & 4294967295
  }

  var hex_chr = "0123456789abcdef".split("");
  if (md5("hello") != "5d41402abc4b2a76b9719d911017c592") {
    add32 = function(e, t) {
      var n = (e & 65535) + (t & 65535), r = (e >> 16) + (t >> 16) + (n >> 16);
      return r << 16 | n & 65535
    }
  }
  //check to make sure you gave us something
  var opt = options || {};
  var
    base,
    params = [];

  //set some defaults, just in case
  opt = {
    size: opt.size || "50",
    rating: opt.rating || "g",
    secure: opt.secure || (location.protocol === 'https:'),
    backup: opt.backup || ""
  };

  //setup the email address
  email = email.trim().toLowerCase();

  //determine which base to use
  base = opt.secure ? 'https://secure.gravatar.com/avatar/' : 'http://www.gravatar.com/avatar/';

  //add the params
  if (opt.rating) {params.push("r=" + opt.rating)}
  if (opt.backup) {params.push("d=" + encodeURIComponent(opt.backup))}
  if (opt.size) {params.push("s=" + opt.size)}

  //now throw it all together
  return base + md5(email) + "?" + params.join("&");
};

/**
 * For more details, see: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 * @param {string} hex
 * @returns {{r:number, g:number, b:number}}
 */
u.hex2rgb = function(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result) { throw new u.Exception('Invalid hex for hex2rgb'); }

  return {
    'r': parseInt(result[1], 16),
    'g': parseInt(result[2], 16),
    'b': parseInt(result[3], 16)
  };
};

/**
 * For more details, see: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
u.rgb2hex = function(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * @param {string} hex
 * @param {number} [alpha]
 * @returns {string}
 */
u.hex2rgba = function(hex, alpha) {
  var rgb = u.hex2rgb(hex);
  alpha == undefined && (alpha = 1);
  return 'rgba(' + rgb['r'] + ',' + rgb['g'] + ',' + rgb['b'] + ',' + alpha + ')';
};

/**
 * Copyright (c) 2009-2016, Alexis Sellier <self@cloudhead.net>
 * See for details: https://github.com/less/less.js
 * @param {string} hex
 * @returns {{h: number, s: number, l: number}}
 */
u.hex2hsl = function(hex) {
  var rgb = u.hex2rgb(hex);
  var r = rgb['r'] / 255,
    g = rgb['g'] / 255,
    b = rgb['b'] / 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2, d = max - min;

  if (max === min) {
    h = s = 0;
  } else {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { 'h': h * 360, 's': s, 'l': l };
};

/**
 * Copyright (c) 2009-2016, Alexis Sellier <self@cloudhead.net>
 * See for details: https://github.com/less/less.js
 * @param {{h:number, s:number, l:number}} hsl
 * @returns {{r: number, g: number, b: number}}
 */
u.hsl2rgb = function(hsl) {
  var h = hsl['h'], s = hsl['s'], l = hsl['l'];
  var m1, m2;

  function hue(h) {
    h = h < 0 ? h + 1 : (h > 1 ? h - 1 : h);
    if (h * 6 < 1) {
      return m1 + (m2 - m1) * h * 6;
    } else if (h * 2 < 1) {
      return m2;
    } else if (h * 3 < 2) {
      return m1 + (m2 - m1) * (2 / 3 - h) * 6;
    } else {
      return m1;
    }
  }

  h = (Number(h) % 360) / 360;
  s = Math.min(1, Math.max(0, Number(s))); l = Math.min(1, Math.max(0, Number(l)));

  m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
  m1 = l * 2 - m2;

  return {
    'r': Math.floor(hue(h + 1 / 3) * 255),
    'g': Math.floor(hue(h) * 255),
    'b': Math.floor(hue(h - 1 / 3) * 255)
  };
};

/**
 * @param {{h:number, s:number, l:number}} hsl
 * @returns {string}
 */
u.hsl2hex = function(hsl) {
  var rgb = u.hsl2rgb(hsl);
  return u.rgb2hex(rgb['r'], rgb['g'], rgb['b']);
};

/**
 * Copyright (c) 2009-2016, Alexis Sellier <self@cloudhead.net>
 * See for details: https://github.com/less/less.js
 * @param {string} hex
 * @param {number} pc Percent
 * @returns {string}
 */
u.lighten = function (hex, pc) {
  var hsl = u.hex2hsl(hex);

  hsl['l'] += pc;
  hsl['l'] = Math.min(1, Math.max(0, hsl['l']));
  return u.hsl2hex(hsl);
};

/**
 * Copyright (c) 2009-2016, Alexis Sellier <self@cloudhead.net>
 * See for details: https://github.com/less/less.js
 * @param {string} hex
 * @param {number} pc Percent
 * @returns {string}
 */
u.darken = function (hex, pc) {
  var hsl = u.hex2hsl(hex);

  hsl['l'] -= pc;
  hsl['l'] = Math.min(1, Math.max(0, hsl['l']));
  return u.hsl2hex(hsl);
};


goog.provide('u.array');

/**
 * @param {Arguments|Array} args
 * @returns {Array}
 */
u.array.fromArguments = function(args) {
  return /** @type {Array} */ (Array.isArray(args) ? args : [].slice.apply(args));
};

/**
 * Creates an array of length n filled with value
 * @param {number} n
 * @param {*} value
 * @returns {Array}
 */
u.array.fill = function(n, value) {
  n = n || 0;
  var ret = new Array(n);
  for (var i = 0; i < n; ++i) { ret[i] = value; }
  return ret;
};

/**
 * Generates an array of consecutive numbers starting from start, or 0 if it's not defined
 * @param {number} n
 * @param {number} [start]
 * @returns {Array.<number>}
 */
u.array.range = function(n, start) {
  start = start || 0;
  n = n || 0;

  var result = new Array(n);
  for (var i = 0; i < n; ++i) {
    result[i] = i + start;
  }

  return result;
};

/**
 * Returns a new array where all elements are unique
 * Complexity is suboptimal: O(n^2); for strings and numbers,
 * it can be done faster, using a map
 * @param {Array} arr
 * @param {function(*,*): boolean} [equals]
 * @returns {Array}
 */
u.array.unique = function(arr, equals) {
  return arr.reduce(function(result, item) {
    if (!equals) {
      if (result.indexOf(item) < 0) { result.push(item); }
    } else {
      if (u.array.indexOf(result, function(it) { return equals(it, item); }) < 0) { result.push(item); }
    }
    return result;
  }, []);
};

/**
 * @param {Array.<string|number>} arr
 * @returns {Array.<string|number>}
 */
u.array.uniqueFast = function(arr) {
  var ret = [];
  var isSet = {};
  var length = arr.length;
  var item;
  for (var i = 0; i < length; ++i) {
    item = arr[i];
    if (!isSet[item]) {
      ret.push(item);
      isSet[item] = true;
    }
  }

  return ret;
};

/**
 * @param {Array} arr
 * @param {function(*, (number|undefined)): (string|number)} key
 * @returns {Array}
 */
u.array.uniqueKey = function(arr, key) {
  var ret = [];
  var isSet = {};
  var length = arr.length;
  var item, k;
  for (var i = 0; i < length; ++i) {
    item = arr[i];
    k = key(item, i);
    if (!isSet[k]) {
      ret.push(item);
      isSet[k] = true;
    }
  }

  return ret;
};

/**
 * @param {Array} arr
 * @param {function(*, number):boolean} predicate
 * @param {*} [thisArg]
 * @returns {number}
 */
u.array.indexOf = function(arr, predicate, thisArg) {
  for (var i = 0; i < arr.length; ++i) {
    if (predicate.call(thisArg, arr[i], i)) {
      return i;
    }
  }
  return -1;
};


goog.provide('u.TimeSpan');

goog.require('u');

/**
 * @param {number} milliseconds Must be positive
 * @constructor
 */
u.TimeSpan = function(milliseconds) {
  if (milliseconds < 0) { milliseconds = 0; }

  /**
   * @type {number}
   * @private
   */
  this._totalMilliseconds = milliseconds;

  /**
   * @type {?number}
   * @private
   */
  this._totalDays = null;

  /**
   * @type {?number}
   * @private
   */
  this._totalHours = null;

  /**
   * @type {?number}
   * @private
   */
  this._totalMinutes = null;

  /**
   * @type {?number}
   * @private
   */
  this._totalSeconds = null;


  /**
   * @type {?number}
   * @private
   */
  this._days = null;

  /**
   * @type {?number}
   * @private
   */
  this._hours = null;

  /**
   * @type {?number}
   * @private
   */
  this._minutes = null;

  /**
   * @type {?number}
   * @private
   */
  this._seconds = null;

  /**
   * @type {?number}
   * @private
   */
  this._milliseconds = null;
};

/**
 * @constant {number}
 */
u.TimeSpan.MS_IN_SECOND = 1000;

/**
 * @constant {number}
 */
u.TimeSpan.MS_IN_MINUTE = 60 * u.TimeSpan.MS_IN_SECOND;

/**
 * @constant {number}
 */
u.TimeSpan.MS_IN_HOUR = 60 * u.TimeSpan.MS_IN_MINUTE;

/**
 * @constant {number}
 */
u.TimeSpan.MS_IN_DAY = 24 * u.TimeSpan.MS_IN_HOUR;

/**
 * @returns {number}
 */
u.TimeSpan.prototype.days = function() {
  if (this._days == null) { this._days = Math.floor(this.totalDays()); }
  return this._days;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.hours = function() {
  if (this._hours == null) {
    this._hours = Math.floor((this.totalDays() - this.days()) * 24);
  }
  return this._hours;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.minutes = function() {
  if (this._minutes == null) {
    this._minutes = Math.floor((this.totalHours() - Math.floor(this.totalHours())) * 60);
  }
  return this._minutes;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.seconds = function() {
  if (this._seconds == null) {
    this._seconds = Math.floor((this.totalMinutes() - Math.floor(this.totalMinutes())) * 60);
  }
  return this._seconds;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.milliseconds = function() {
  if (this._milliseconds == null) {
    this._milliseconds = this._totalMilliseconds % 1000;
  }
  return this._milliseconds;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalDays = function() {
  if (this._totalDays == null) {
    this._totalDays = this._totalMilliseconds / u.TimeSpan.MS_IN_DAY;
  }
  return this._totalDays;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalHours = function() {
  if (this._totalHours == null) {
    this._totalHours = this._totalMilliseconds / u.TimeSpan.MS_IN_HOUR;
  }
  return this._totalHours;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalMinutes = function() {
  if (this._totalMinutes == null) {
    this._totalMinutes = this._totalMilliseconds / u.TimeSpan.MS_IN_MINUTE;
  }
  return this._totalMinutes;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalSeconds = function() {
  if (this._totalSeconds == null) {
    this._totalSeconds = this._totalMilliseconds / u.TimeSpan.MS_IN_SECOND;
  }
  return this._totalSeconds;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalMilliseconds = function() { return this._totalMilliseconds; };

/**
 * TODO: Add a formatting parameter
 * @override
 * @returns {string}
 */
u.TimeSpan.prototype.toString = function() {
  var ret = '';
  if (this.days() > 0) {
    if (this.days() > 1) { ret += this.days() + ' days'; }
    else { ret += 'one day'}
  }

  if (this.hours() > 0) {
    if (ret) { ret += ', '; }
    if (this.hours() > 1) { ret += this.hours() + ' hours'; }
    else { ret += 'one hour'; }
  }

  if (this.minutes() > 0) {
    if (ret) { ret += ' and '; }
    if (this.minutes() > 1) { ret += this.minutes() + ' minutes'; }
    else { ret += 'one minute'; }
  } else if (!ret) {
    ret += 'less than a minute';
  }

  return u.string.capitalizeFirstLetter(ret);
};



goog.provide('u.string');

/**
 * @param {string} text
 * @returns {string}
 */
u.string.capitalizeFirstLetter = function (text) {
  if (!text) { return text; }
  return text.charAt(0).toUpperCase() + text.slice(1);
};


goog.provide('u.Exception');

/**
 * @param {string} message
 * @param {Error} [innerException]
 * @constructor
 * @extends Error
 */
u.Exception = function(message, innerException) {
  /**
   * @type {Error}
   * @private
   */
  this._errorCore = new Error(message);

  /**
   * @type {Error}
   * @private
   */
  this._innerException = innerException || null;

  /**
   * @type {string}
   */
  this.message = this._errorCore.message;

  /**
   * @type {string}
   */
  this.name = 'Exception';
};

goog.inherits(u.Exception, Error);

Object.defineProperties(u.Exception.prototype, {
  /**
   * @property
   * @type {string}
   * @name u.Exception#stack
   */
  'stack': /** @type {string} */ ({
    get: /** @type {function (this:u.Exception): string} */ (function() { return this._errorCore.stack; })
  }),

  /**
   * @property
   * @type {Error}
   * @name u.Exception#innerException
   */
  'innerException': /** @type {Error} */ ({
    get: /** @type {function (this:u.Exception): Error} */ (function() { return this._innerException; })
  })
});


goog.provide('u.reflection');
goog.require('u.array');

goog.require('u.Exception');

/**
 * @param {string} message
 * @param {Error} [innerException]
 * @constructor
 * @extends u.Exception
 */
u.reflection.ReflectionException = function(message, innerException) {
  u.Exception.apply(this, arguments);

  /**
   * @type {string}
   */
  this.name = 'ReflectionException';
};

goog.inherits(u.reflection.ReflectionException, u.Exception);


/**
 * Evaluates the given string into a constructor for a type
 * @param {string} typeName
 * @param {Object} [context]
 * @returns {function(new: T)}
 * @template T
 */
u.reflection.evaluateFullyQualifiedTypeName = function(typeName, context) {
  var result;

  try {
    var namespaces = typeName.split('.');
    var func = namespaces.pop();
    var ctx = context || window;
    for (var i = 0; i < namespaces.length; ++i) {
      ctx = ctx[namespaces[i]];
    }
    result = ctx[func];
  } catch (error) {
    throw new u.reflection.ReflectionException('Unknown type name: ' + typeName, error);
  }

  if (typeof(result) !== 'function') {
    throw new u.reflection.ReflectionException('Unknown type name: ' + typeName);
  }

  return result;
};

/**
 * Applies the given constructor to the given parameters and creates
 * a new instance of the class it defines
 * @param {function(new: T)} ctor
 * @param {Array|Arguments} params
 * @returns {T}
 * @template T
 */
u.reflection.applyConstructor = function(ctor, params) {
  return new (Function.prototype.bind.apply(ctor, [null].concat(u.array.fromArguments(params || []))));
};

/**
 * Wraps given type around the given object, so the object's prototype matches the one of the type
 * @param {Object} o
 * @param {function(new: T)} type
 * @returns {T}
 * @template T
 */
u.reflection.wrap = function(o, type) {
  //o.__proto__ = type.prototype;
  //return o;

  if (o instanceof type) { return o; }

  var props = {};
  for (var p in o) {
    if (!o.hasOwnProperty(p)) { continue; }
    (function(p) {
      props[p] = {
        get: function() { return o[p]; },
        set: function(value) { o[p] = value; },
        configurable: true,
        enumerable: true
      };
    })(p);
  }

  return Object.create(type.prototype, props);
};


goog.provide('u.async');
goog.require('u.array');
goog.require('u.reflection');

/**
 * @param {Array.<function(): Promise>} jobs
 * @param {boolean} [inOrder] If true, the jobs are executed in order, otherwise, in parallel
 * @returns {Promise}
 */
u.async.all = function(jobs, inOrder) {
  if (inOrder) {  return u.async.each(jobs, function(job) { return job(); }, inOrder); }
  return Promise.all(jobs.map(function(job) { return job(); }));
};

/**
 * @param {number} n
 * @param {function(number, (number|undefined)): Promise} iteration
 * @param {boolean} [inOrder]
 * @returns {Promise}
 */
u.async.for = function(n, iteration, inOrder) {
  return u.async.each(u.array.range(n), iteration, inOrder);
};

/**
 * @param {function(number): Promise} iteration
 * @returns {Promise}
 */
u.async.do = function(iteration) {
  return new Promise(function(resolve, reject) {
    var i = 0;
    var it = function() {
      return iteration(i++).then(function(condition) {
        return !condition || it();
      });
    };
    it().then(resolve);
  });
};

/**
 * @param {Array.<T>} items
 * @param {function(T, number): Promise} iteration
 * @param {boolean} [inOrder]
 * @returns {Promise}
 * @template T
 */
u.async.each = function(items, iteration, inOrder) {
  if (inOrder) {
    return new Promise(function(resolve, reject) {
      if (!items || !items.length) {
        resolve();
      }

      var d, remaining;
      d = new Array(items.length+1);
      d[0] = new Promise(function(resolve) { resolve(); });

      items.forEach(function(item, i) {
        d[i + 1] = d[i].then(function() { return iteration.call(null, item, i); });
      });

      d[items.length].then(resolve);
    });
  } else {
    return Promise.all(items.map(function(item, i) { return iteration(item, i); }));
  }
};

/**
 * @constructor
 * @template T
 */
u.async.Deferred = function() {
  /**
   * @type {Function}
   * @private
   */
  this._resolve = null;

  /**
   * @type {Function}
   * @private
   */
  this._reject = null;

  var self = this;

  /**
   * @type {Promise}
   * @private
   */
  this._promise = new Promise(function() { self._resolve = arguments[0]; self._reject = arguments[1]; });
};

/**
 * @param {T} [value]
 */
u.async.Deferred.prototype.resolve = function(value) {
  this._resolve.call(this._promise, value);
};

/**
 * @param {*} [reason]
 */
u.async.Deferred.prototype.reject = function(reason) {
  this._reject.call(this._promise, reason);
};

/**
 * @param {function((T|undefined))} [onFulfilled]
 * @param {function(*)} [onRejected]
 * @returns {Promise}
 */
u.async.Deferred.prototype.then = function(onFulfilled, onRejected) {
  return this._promise.then(onFulfilled, onRejected);
};

/**
 * @param {function(*)} onRejected
 * @returns {Promise}
 */
u.async.Deferred.prototype.catch = function(onRejected) {
  return this._promise.catch(onRejected);
};


goog.provide('u.UnimplementedException');

goog.require('u.Exception');

/**
 * @param {string} message
 * @param {Error} [innerException]
 * @constructor
 * @extends u.Exception
 */
u.UnimplementedException = function(message, innerException) {
  u.Exception.apply(this, arguments);

  /**
   * @type {string}
   */
  this.name = 'UnimplementedException';
};

goog.inherits(u.UnimplementedException, u.Exception);


goog.provide('u.QuadTree');

/**
 * @param {number} x Offset
 * @param {number} y Offset
 * @param {number} w Width
 * @param {number} h Height
 * @param {number} minQuadrantRatio
 * @param {number} maxQuadrantCapacity
 * @constructor
 */
u.QuadTree = function(x, y, w, h, minQuadrantRatio, maxQuadrantCapacity) {
  /**
   * @type {number}
   * @private
   */
  this._x = x;

  /**
   * @type {number}
   * @private
   */
  this._y = y;

  /**
   * @type {number}
   * @private
   */
  this._w = w;

  /**
   * @type {number}
   * @private
   */
  this._h = h;

  /**
   * Convert v between x and x+w to v' between 0 and 1
   * @type {function(number):number}
   * @private
   */
  this._normX = function(v) { return (v - x) / w; };

  /**
   * Convert v between 0 and 1 to v' between x and x+w
   * @type {function(number):number}
   * @private
   */
  this._scaleX = function(v) { return v * w + x; };

  /**
   * Convert v between y and y+h to v' between 0 and 1
   * @type {function(number):number}
   * @private
   */
  this._normY = function(v) { return (v - y) / h; };

  /**
   * Convert v between 0 and 1 to v' between x and y+h
   * @type {function(number):number}
   * @private
   */
  this._scaleY = function(v) { return v * h + y; };

  /**
   * @type {function(number):number}
   * @private
   */
  this._normW = function(v) { return v / w; };

  /**
   * Convert v between 0 and 1 to v' between 0 and w
   * @type {function(number):number}
   * @private
   */
  this._scaleW = function(v) { return v * w; };

  /**
   * @type {function(number):number}
   * @private
   */
  this._normH = function(v) { return v / h; };

  /**
   * Convert v between 0 and 1 to v' between 0 and h
   * @type {function(number):number}
   * @private
   */
  this._scaleH = function(v) { return v * h; };

  /**
   * @type {number}
   * @private
   */
  this._count = 0;

  /**
   * @type {number}
   * @private
   */
  this._minQuadrantRatio = minQuadrantRatio;

  /**
   * @type {number}
   * @private
   */
  this._maxQuadrantCapacity = maxQuadrantCapacity;

  /**
   * @type {u.QuadTree.Node}
   */
  this._root = new u.QuadTree.Node(0, 0, 1);
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {*} [value]
 */
u.QuadTree.prototype.insert = function(x, y, w, h, value) {
  this._insert(this._root, new u.QuadTree.Item(
    this._normX(x),
    this._normY(y),
    this._normW(w),
    this._normH(h),
    value));

  ++this._count;
};

/**
 * @param {u.QuadTree.Node} node
 * @param {u.QuadTree.Item} item
 * @private
 */
u.QuadTree.prototype._insert = function(node, item) {
  if (node.ne != null) {
    var quad = this._getQuadrant(node, item);

    if (quad != null) {
      this._insert(quad, item);
      return;
    }
  }

  node.items.push(item);

  if (node.items.length > this._maxQuadrantCapacity && node.size * 0.5 >= this._minQuadrantRatio) {
    if (node.ne == null) {
      this._split(node);

      var i = 0;
      while (i < node.items.length) {
        var quad = this._getQuadrant(node, node.items[i]);
        if (quad != null) {
          this._insert(quad, node.items.splice(i, 1)[0]);
        } else {
          ++i;
        }
      }
    }
  }
};

/**
 * Splits the node into 4 subnodes
 * @param {u.QuadTree.Node} node
 * @private
 */
u.QuadTree.prototype._split = function(node) {
  var size = node.size * 0.5;
  var x = node.x;
  var y = node.y;

  node.ne = new u.QuadTree.Node(x + size, y, size, node);
  node.se = new u.QuadTree.Node(x + size, y + size, size, node);
  node.sw = new u.QuadTree.Node(x, y + size, size, node);
  node.nw = new u.QuadTree.Node(x, y, size, node);
};

/**
 * Determine which node the object belongs to. null means
 * object cannot completely fit within a child node and is part
 * of the parent node
 * @param {u.QuadTree.Node} node
 * @param {u.QuadTree.Item} item
 * @returns {u.QuadTree.Node}
 * @private
 */
u.QuadTree.prototype._getQuadrant = function(node, item) {
  var ret = null;
  var mx = node.x + node.size * 0.5;
  var my = node.y + node.size * 0.5;

  // Object can completely fit within the top quadrants
  var topQuadrant = (item.y < my && item.y + item.h < my);
  
  // Object can completely fit within the bottom quadrants
  var bottomQuadrant = (item.y > my);

  if (item.x < mx && item.x + item.w < mx) {
    // Object can completely fit within the left quadrants
    if (topQuadrant) {
      ret = node.nw;
    } else if (bottomQuadrant) {
      ret = node.sw;
    }
  } else if (item.x > mx) {
    // Object can completely fit within the right quadrants
    if (topQuadrant) {
      ret = node.ne;
    } else if (bottomQuadrant) {
      ret = node.se;
    }
  }

  return ret;
};

/**
 * @param {number} x
 * @param {number} y
 * @returns {Array.<{x: number, y: number, w: number, h: number, value: *}>}
 */
u.QuadTree.prototype.collisions = function(x, y) {
  var point = {
    'x': this._normX(x),
    'y': this._normY(y)
  };

  return this._computeCollisions(this._root, point, []);
};

/**
 *
 * @param {u.QuadTree.Node} node
 * @param {{x: number, y: number}} p
 * @param {Array.<{x: number, y: number, w: number, h: number, value: *}>} ret
 * @returns {Array.<{x: number, y: number, w: number, h: number, value: *}>}
 * @private
 */
u.QuadTree.prototype._computeCollisions = function(node, p, ret) {
  var self = this;
  Array.prototype.push.apply(ret, u.fast.map(u.fast.filter(node.items,
    // filter:
    function(item) {
      return item.x <= p['x'] &&
          item.x + item.w > p['x'] &&
          item.y <= p['y'] &&
          item.y + item.h > p['y'];
    }),
    // map:
    function(item) {
      return {'x': self._scaleX(item.x), 'y': self._scaleY(item.y), 'w': self._scaleW(item.w), 'h': self._scaleH(item.h), 'value': item.value};
    })
  );

  if (node.ne == null) { return ret; }

  if (node.nw.x + node.nw.size > p['x']) {
    if (node.nw.y + node.nw.size > p['y']) {
      return this._computeCollisions(node.nw, p, ret);
    } else {
      return this._computeCollisions(node.sw, p, ret);
    }
  } else {
    if (node.ne.y + node.ne.size > p['y']) {
      return this._computeCollisions(node.ne, p, ret);
    } else {
      return this._computeCollisions(node.se, p, ret);
    }
  }
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @returns {Array.<{x: number, y: number, w: number, h: number, value: *}>}
 */
u.QuadTree.prototype.overlaps = function(x, y, w, h) {
  var item = new u.QuadTree.Item(
    this._normX(x),
    this._normY(y),
    this._normW(w),
    this._normH(h));

  return this._computeOverlaps(this._root, item, []);
};

/**
 * @param {u.QuadTree.Node} node
 * @param {u.QuadTree.Item} item
 * @param {Array.<{x: number, y: number, w: number, h: number, value: *}>} ret
 * @returns {Array.<{x: number, y: number, w: number, h: number, value: *}>}
 * @private
 */
u.QuadTree.prototype._computeOverlaps = function(node, item, ret) {
  var self = this;
  Array.prototype.push.apply(ret, u.fast.map(u.fast.filter(node.items,
    // filter
    function(it) {
      return it.x < item.x + item.w &&
        it.x + it.w > item.x &&
        it.y < item.y + item.h &&
        it.y + it.h > item.y;
    }),
    // map
    function(it) {
      return {'x': self._scaleX(it.x), 'y': self._scaleY(it.y), 'w': self._scaleW(it.w), 'h': self._scaleH(it.h), 'value': it.value};
    })
  );

  if (node.ne == null) { return ret; }

  var quad = this._getQuadrant(node, item);
  if (quad != null) { return this._computeOverlaps(quad, item, ret); }

  var mx = node.x + node.size * 0.5;
  var my = node.y + node.size * 0.5;

  // Object can completely fit within the top quadrants
  if (item.y + item.h < my) {
    this._computeOverlaps(node.nw, item, ret);
    return this._computeOverlaps(node.ne, item, ret);
  }

  // Object can completely fit within the bottom quadrants
  if (item.y > my) {
    this._computeOverlaps(node.sw, item, ret);
    return this._computeOverlaps(node.se, item, ret);
  }

  // Object can completely fit within the left quadrants
  if (item.x + item.w < mx) {
    this._computeOverlaps(node.nw, item, ret);
    return this._computeOverlaps(node.sw, item, ret);
  }

  // Object can completely fit within the right quadrants
  if (item.x > mx) {
    this._computeOverlaps(node.ne, item, ret);
    return this._computeOverlaps(node.se, item, ret);
  }

  this._computeOverlaps(node.ne, item, ret);
  this._computeOverlaps(node.se, item, ret);
  this._computeOverlaps(node.sw, item, ret);
  return this._computeOverlaps(node.nw, item, ret);
};

/**
 * @returns {Array.<{x: number, y: number, w: number, h: number, items: Array}>}
 */
u.QuadTree.prototype.leaves = function() {
  return this._computeLeaves(this._root, []);
};

/**
 * @param {u.QuadTree.Node} node
 * @param {Array.<{x: number, y: number, w: number, h: number, items: Array}>} ret
 * @returns {Array.<{x: number, y: number, w: number, h: number, items: Array}>}
 * @private
 */
u.QuadTree.prototype._computeLeaves = function(node, ret) {
  if (node.ne == null) {
    ret.push({
      'x': this._scaleX(node.x),
      'y': this._scaleY(node.y),
      'w': this._scaleW(node.size),
      'h': this._scaleH(node.size),
      'items': node.items
    });
    return ret;
  }

  this._computeLeaves(node.ne, ret);
  this._computeLeaves(node.se, ret);
  this._computeLeaves(node.sw, ret);
  this._computeLeaves(node.nw, ret);

  return ret;
};

/**
 * @returns {Array}
 */
u.QuadTree.prototype.values = function() {
  var ret = [];
  var dfs = function(node) {
    ret = ret.concat(u.fast.map(node.items, function(item) { return item.value; }));
    if (node.ne) { dfs(node.ne); }
    if (node.nw) { dfs(node.nw); }
    if (node.sw) { dfs(node.sw); }
    if (node.se) { dfs(node.se); }
  };
  dfs(this._root);
  return ret;
};

/**
 * @returns {Array.<{x: number, y: number, w: number, h: number, value: *}>}
 */
u.QuadTree.prototype.items = function() {
  var self = this;
  var ret = [];
  var dfs = function(node) {
    ret = ret.concat(u.fast.map(node.items, function(it) {
      return {'x': self._scaleX(it.x), 'y': self._scaleY(it.y), 'w': self._scaleW(it.w), 'h': self._scaleH(it.h), 'value': it.value};
    }));
    if (node.ne) { dfs(node.ne); }
    if (node.nw) { dfs(node.nw); }
    if (node.sw) { dfs(node.sw); }
    if (node.se) { dfs(node.se); }
  };
  dfs(this._root);
  return ret;
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {u.QuadTree.Node} [parent]
 * @constructor
 */
u.QuadTree.Node = function(x, y, size, parent) {
  /**
   * @type {number}
   */
  this.x = x;

  /**
   * @type {number}
   */
  this.y = y;

  /**
   * @type {number}
   */
  this.size = size;

  /**
   * @type {u.QuadTree.Node|null}
   */
  this.parent = parent || null;

  /**
   * @type {u.QuadTree.Node|null}
   */
  this.ne = null;

  /**
   * @type {u.QuadTree.Node|null}
   */
  this.se = null;

  /**
   * @type {u.QuadTree.Node|null}
   */
  this.sw = null;

  /**
   * @type {u.QuadTree.Node|null}
   */
  this.nw = null;

  /**
   * @type {Array.<u.QuadTree.Item>}
   */
  this.items = [];
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {*} [value]
 * @constructor
 */
u.QuadTree.Item = function(x, y, w, h, value) {
  /**
   * @type {number}
   */
  this.x = x;

  /**
   * @type {number}
   */
  this.y = y;

  /**
   * @type {number}
   */
  this.w = w;

  /**
   * @type {number}
   */
  this.h = h;

  /**
   * @type {*}
   */
  this.value = value;
};


goog.provide('u.fast');

/**
 * @param {Array} arr
 * @param {function(*, (number|undefined)): *} callback
 * @returns {!Array}
 */
u.fast.map = function(arr, callback) {
  var length = arr.length;
  var ret = new Array(length);
  for (var i = 0; i < length; ++i) {
    ret[i] = callback(arr[i], i);
  }
  return ret;
};

/**
 * @param {Array.<Array>} arrays
 * @returns {!Array}
 */
u.fast.concat = function(arrays) {
  if (arrays.length == 1) { return /** @type {!Array} */ (arrays[0]); }
  if (arrays.length == 2) {
    return arrays[0].concat(arrays[1]);
  }

  var length = arrays.length;
  var totalLength = 0;
  var i;
  for (i = 0; i < length; ++i) {
    totalLength += arrays[i].length;
  }
  var ret = new Array(totalLength);
  var j = 0, k = 0, l, a;

  for (i = 0; i < length; ++i) {
    a = arrays[i];
    l = a.length;
    for (j = 0; j < l; ++j, ++k) {
      ret[k] = a[j];
    }
  }
  return ret;
};

/**
 * @param {Array} arr
 * @param {function(*, (number|undefined)): boolean} predicate
 * @returns {!Array}
 */
u.fast.filter = function(arr, predicate) {
  var length = arr.length;
  var ret = [];
  for (var i = 0; i < length; ++i) {
    var item = arr[i];
    if (predicate(item, i)) { ret.push(item); }
  }
  return ret;
};

/**
 * @param {Array} arr
 * @param {function((*|undefined), (number|undefined), (Array|undefined))} callback
 * @param {*} [thisArg]
 */
u.fast.forEach = function(arr, callback, thisArg) {
  var length = arr.length;
  for (var i = 0; i < length; ++i) {
    callback.call(thisArg, arr[i], i, arr);
  }
};


goog.provide('u.Promise');

(function(window) {
  if ('Promise' in window) { return; }

  /**
   * @param {function(function(*), function(*))} resolver
   * @constructor
   */
  var PromisePolyfill = function(resolver) {
    if (typeof resolver != 'function') {
      throw new TypeError('Promise resolver ' + resolver + ' is not a function');
    }

    /**
     * @type {Array.<Function>}
     * @private
     */
    this._fulfilledCallbacks = [];

    /**
     * @type {Array.<Function>}
     * @private
     */
    this._rejectedCallbacks = [];

    /**
     * @type {boolean}
     * @private
     */
    this._resolved = false;

    /**
     * @type {boolean}
     * @private
     */
    this._rejected = false;

    /**
     * @type {*}
     * @private
     */
    this._resolvedVal = undefined;

    /**
     * @type {*}
     * @private
     */
    this._rejectedReason = undefined;

    var self = this;
    try {
      resolver(
        // Resolve
        function (value) {
          self._resolved = true;
          self._resolvedVal = value;
          self._callAllFulfilled(value);
        },
        // Reject
        function (reason) {
          self._rejected = true;
          self._rejectedReason = reason;
          self._callAllRejected(reason);
        });
    } catch (err) {
      self._callAllRejected(err);
    }
  };

  /**
   * @param {function(*)} [onFulfilled]
   * @param {function(*)} [onRejected]
   * @returns {PromisePolyfill}
   */
  PromisePolyfill.prototype['then'] = function (onFulfilled, onRejected) {
    var resolve, reject;
    var ret = new PromisePolyfill(function() { resolve = arguments[0]; reject = arguments[1]; });
    var fulfilledWrapper, rejectedWrapper;
    if (typeof onFulfilled == 'function') {
      fulfilledWrapper = function(value) {
        try {
          var next = onFulfilled.call(null, value);
          if (next instanceof PromisePolyfill) {
            next['then'](resolve, reject);
          } else {
            resolve(next);
          }
        } catch (err) {
          reject(err);
        }
      };
      this._fulfilledCallbacks.push(fulfilledWrapper);
    }
    if (typeof onRejected == 'function') {
      rejectedWrapper = function(reason) {
        try {
          var next = onRejected.call(null, reason);
          if (next instanceof PromisePolyfill) {
            next['then'](resolve, reject);
          } else {
            resolve(next);
          }
        } catch (err) {
          reject(err);
        }
      };
      this._rejectedCallbacks.push(rejectedWrapper);
    }

    var self = this;
    if (this._resolved) {
      setTimeout(function() { fulfilledWrapper.call(null, self._resolvedVal); }, 0);
    } else if (this._rejected) {
      setTimeout(function() { rejectedWrapper.call(null, self._rejectedReason); }, 0);
    }

    return ret;
  };

  /**
   * @param {function(*)} [onRejected]
   * @returns {PromisePolyfill}
   */
  PromisePolyfill.prototype['catch'] = function(onRejected) { return this['then'](undefined, onRejected); };

  /**
   * @param {T} value
   * @template T
   */
  PromisePolyfill.prototype._callAllFulfilled = function(value) {
    this._fulfilledCallbacks.forEach(function(callback) {
      setTimeout(function() {  callback.call(null, value); }, 0);
    });
    this._fulfilledCallbacks = [];
  };

  /**
   * @param {*} reason
   */
  PromisePolyfill.prototype._callAllRejected = function(reason) {
    this._rejectedCallbacks.forEach(function(callback) {
      setTimeout(function() {  callback.call(null, reason); }, 0);
    });
    this._rejectedCallbacks = [];
  };

  /**
   * @param {*} [value]
   * @returns {PromisePolyfill}
   */
  PromisePolyfill['resolve'] = function(value) { return new PromisePolyfill(function(resolve) { resolve(value); }); };

  /**
   * @param {*} [reason]
   * @returns {PromisePolyfill}
   */
  PromisePolyfill['reject'] = function(reason) { return new PromisePolyfill(function(resolve, reject) { reject(reason); }); };

  /**
   * @param {Array} promises
   * @returns {PromisePolyfill}
   */
  PromisePolyfill['all'] = function(promises) {
    if (!promises || !promises.length) { return PromisePolyfill['resolve'](); }
    return new PromisePolyfill(function(resolve, reject) {
      var ret = new Array(promises.length);
      var remaining = promises.length;
      promises.forEach(function(promise, i) {
        var p = (promise instanceof PromisePolyfill) ? promise : PromisePolyfill['resolve'](promise);
        p['then'](
          function(value) {
            ret[i] = value;
            --remaining;
            if (!remaining) { resolve(ret); }
          },
          function(reason) {
            reject(reason);
          });
      });
    });
  };

  window['Promise'] = PromisePolyfill;
})(this);


goog.provide('u.math');

/**
 * @param {number} x
 * @param {number} precision
 * @returns {number}
 */
u.math.floorPrecision = function(x, precision) {
  if (precision == 0) { return Math.floor(x); }
  var m = Math.pow(10, precision);
  return Math.floor(x * m) / m;
};

/**
 * Lightweight linear scale function for use outside the DOM (as opposed to d3.scale.linear
 * @param {Array.<number>} domain An array with exactly two arguments: lower and upper bound of the range
 * @param {Array.<number>} range An array with exactly two arguments: lower and upper bound of the range
 * @returns {function(number): number}
 */
u.math.scaleLinear = function(domain, range) {
  var domainSize = domain[1] - domain[0];
  var rangeSize = range[1] - range[0];
  var r = rangeSize / domainSize;
  return function(x) { return range[0] + (x - domain[0]) * r; };
};

/**
 * @param {number} deg
 * @returns {number}
 */
u.math.deg2rad = function(deg) { return deg * Math.PI / 180; };

/**
 * @param {number} rad
 * @returns {number}
 */
u.math.rad2deg = function(rad) { return rad * 180 / Math.PI; };


goog.provide('u.AbstractMethodException');

goog.require('u.Exception');

/**
 * @param {string} message
 * @param {Error} [innerException]
 * @constructor
 * @extends u.Exception
 */
u.AbstractMethodException = function(message, innerException) {
  u.Exception.apply(this, arguments);

  /**
   * @type {string}
   */
  this.name = 'AbstractMethodException';
};

goog.inherits(u.AbstractMethodException, u.Exception);


goog.provide('u.Geolocation');

/**
 * @param {number} lat
 * @param {number} lng
 * @param {number} [accuracy=0] The accuracy level of the latitude and longitude coordinates. It is specified in units and
 *   must be supported by all implementations. The value of the accuracy attribute must be a non-negative real number.
 * @param {u.Geolocation.Unit} [unit]
 * @param {number} [zoom] Google Maps zoom level
 * @param {number} [range] Radius in units around center; not to be confused with accuracy!
 * @param {number} [alt] In units. The height of the position, specified in units above the [WGS84] ellipsoid. If the
 *   implementation cannot provide altitude information, the value of this attribute must be null.
 * @param {number} [altAccuracy] In units. If the implementation cannot provide altitude information, the value of this
 *   attribute must be null. Otherwise, the value of the altitudeAccuracy attribute must be a non-negative real number.
 * @param {number} [heading] The direction of travel of the hosting device and is specified in degrees,
 *   where 0� ? heading < 360�, counting clockwise relative to the true north. If the implementation cannot provide
 *   heading information, the value of this attribute must be null. If the hosting device is stationary (i.e. the value
 *   of the speed attribute is 0), then the value of the heading attribute must be NaN.
 * @param {number} [speed] Denotes the magnitude of the horizontal component of the hosting device's current velocity
 *   and is specified in units per second. If the implementation cannot provide speed information, the value of this
 *   attribute must be null. Otherwise, the value of the speed attribute must be a non-negative real number.
 * @constructor
 */
u.Geolocation = function (lat, lng, accuracy, unit, zoom, range, alt, altAccuracy, heading, speed) {
  /**
   * @type {number}
   */
  this['lat'] = lat;

  /**
   * @type {number}
   */
  this['lng'] = lng;

  /**
   * @type {number}
   */
  this['range'] = (range == undefined) ? null : range;

  /**
   * @type {number}
   */
  this['accuracy'] = accuracy || 0;

  /**
   * @type {number}
   */
  this['zoom'] = (zoom == undefined) ? null : zoom;

  /**
   * @type {u.Geolocation.Unit}
   */
  this['unit'] = unit || u.Geolocation.Unit['M'];

  /**
   * @type {number}
   */
  this['alt'] = (alt == undefined) ? null : alt;

  /**
   * @type {number}
   */
  this['altAccuracy'] = (altAccuracy == undefined) ? null : altAccuracy;

  /**
   * @type {number}
   */
  this['heading'] = (heading == undefined) ? null : heading;

  /**
   * @type {number}
   */
  this['speed'] = (speed == undefined) ? null : speed;
};

/**
 * @param {u.Geolocation} [other]
 * @returns {boolean}
 */
u.Geolocation.prototype.equals = function(other) {
  if (other == undefined) { return false; }
  var g = (other instanceof u.Geolocation) ? other : new u.Geolocation(other['lat'], other['lng'], other['accuracy'], other['unit'], other['zoom'], other['range'], other['alt'], other['altAccuracy'], other['heading'], other['speed']);

  var converted = u.Geolocation.convert(g, this['unit']);
  return this['lat'] == converted['lat'] && this['lng'] == converted['lng'] && this['zoom'] == converted['zoom'] &&
    this['range'] == converted['range'] && this['accuracy'] == converted['accuracy'] && this['alt'] == converted['alt'] &&
    this['altAccuracy'] == converted['altAccuracy'] && this['heading'] == converted['heading'] && this['speed'] == converted['speed'];
};

/**
 * @returns {u.Geolocation}
 */
u.Geolocation.prototype.copy = function() {
  return new u.Geolocation(this['lat'], this['lng'], this['accuracy'], this['unit'], this['zoom'],
    this['range'], this['alt'], this['altAccuracy'], this['heading'], this['speed']);
};


/**
 * @license MIT License http://www.movable-type.co.uk/scripts/latlong.html
 */
/**
 * Returns the distance from ‘this’ point to destination point (using haversine formula).
 *
 * @param   {u.Geolocation|{lat: number, lng: number}} point - Latitude/longitude of destination point.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} Distance between this point and destination point, in same units as radius (meters by default).
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 *     var p2 = new LatLon(48.857, 2.351);
 *     var d = p1.distanceTo(p2); // 404.3 km
 */
u.Geolocation.prototype.distanceTo = function(point, radius) {
  radius = (radius === undefined) ? 6371010 : Number(radius);

  var R = radius;
  var phi1 = u.math.deg2rad(this['lat']),  lambda1 = u.math.deg2rad(this['lng']);
  var phi2 = u.math.deg2rad(point['lat']), lambda2 = u.math.deg2rad(point['lng']);
  var dphi = phi2 - phi1;
  var dlambda = lambda2 - lambda1;

  var a = Math.sin(dphi/2) * Math.sin(dphi/2)
    + Math.cos(phi1) * Math.cos(phi2)
    * Math.sin(dlambda/2) * Math.sin(dlambda/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * FIXME: Untested
 * Returns the destination point from ‘this’ point having travelled the given distance on the
 * given initial bearing (bearing normally varies around path followed).
 *
 * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
 * @param   {number} bearing - Initial bearing in degrees from north.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {u.Geolocation} Destination point.
 *
 * @example
 *     var p1 = new LatLon(51.4778, -0.0015);
 *     var p2 = p1.destinationPoint(7794, 300.7); // 51.5135°N, 000.0983°W
 */
u.Geolocation.prototype.destinationPoint = function(distance, bearing, radius) {
  radius = (radius === undefined) ? 6371010 : Number(radius);

  // see http://williams.best.vwh.net/avform.htm#LL

  var delta = Number(distance) / radius; // angular distance in radians
  var theta = u.math.deg2rad(Number(bearing));

  var phi1 = u.math.deg2rad(this['lat']);
  var lambda1 = u.math.deg2rad(this['lng']);

  var phi2 = Math.asin(Math.sin(phi1)*Math.cos(delta) + Math.cos(phi1)*Math.sin(delta)*Math.cos(theta));
  var x = Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2);
  var y = Math.sin(theta) * Math.sin(delta) * Math.cos(phi1);
  var lambda2 = lambda1 + Math.atan2(y, x);

  return new u.Geolocation(u.math.rad2deg(phi2), (u.math.rad2deg(lambda2)+540)%360-180, 0); // normalize to −180..+180°
};

/**
 * FIXME: Untested
 * @param {number} dist
 * @param {u.Geolocation.Unit} [unit]
 * @returns {{sw: u.Geolocation, ne:u.Geolocation}}
 */
u.Geolocation.prototype.boundingBox = function(dist, unit) {
  var MIN_LAT = -Math.PI / 2;
  var MAX_LAT = Math.PI / 2;
  var MIN_LNG = -Math.PI;
  var MAX_LNG = Math.PI;

  // Calculate the radius of the earth (spherical)
  var radius2 = u.Geolocation.getEarthRadiusWGS84(this['lat'], unit);

  // Angular dist in radians on a great circle
  var angular = dist / radius2;

  // Latitude and longitude in radians
  var radLat = u.math.deg2rad(this['lat']);
  var radLng = u.math.deg2rad(this['lng']);

  // Initial min and max
  var sLat = radLat - angular;
  var nLat = radLat + angular;
  var wLng = 0;
  var eLng = 0;

  if (sLat > MIN_LAT && nLat < MAX_LAT) {
    var deltaLng = Math.asin(Math.sin(angular) / Math.cos(radLat));

    wLng = radLng - deltaLng;
    if (wLng < MIN_LNG) { wLng += 2 * Math.PI; }

    eLng = radLng + deltaLng;
    if (eLng > MAX_LNG) { eLng -= 2 * Math.PI; }
  } else {
    // A pole is within the dist
    sLat = Math.max(sLat, MIN_LAT);
    nLat = Math.min(nLat, MAX_LAT);
    wLng = MIN_LNG;
    eLng = MAX_LNG;
  }

  return {
    'sw': new u.Geolocation(u.math.rad2deg(sLat), u.math.rad2deg(wLng), 0),
    'ne': new u.Geolocation(u.math.rad2deg(nLat), u.math.rad2deg(eLng), 0)
  };
};

/**
 * @license MIT License http://www.movable-type.co.uk/scripts/latlong.html
 */
/**
 * Computes the distance between the two given locations (using haversine formula) in meters.
 * @param {{lat: number, lng: number}} l1
 * @param {{lat: number, lng: number}} l2
 * @returns {number}
 */
u.Geolocation.distanceBetween = function(l1, l2) {
  var R = 6371010;
  var phi1 = u.math.deg2rad(l1['lat']), lambda1 = u.math.deg2rad(l1['lng']);
  var phi2 = u.math.deg2rad(l2['lat']), lambda2 = u.math.deg2rad(l2['lng']);
  var dphi = phi2 - phi1;
  var dlambda = lambda2 - lambda1;

  var a = Math.sin(dphi/2) * Math.sin(dphi/2)
    + Math.cos(phi1) * Math.cos(phi2)
    * Math.sin(dlambda/2) * Math.sin(dlambda/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * FIXME: Untested
 * Earth radius at a given lat, according to the WGS-84 ellipsoid figure
 * @param {number} lat The lat of the coordinate.
 * @param {u.Geolocation.Unit} [unit]
 */
u.Geolocation.getEarthRadiusWGS84 = function(lat, unit) {
  // http://en.wikipedia.org/wiki/Earth_radius

  var WGS84_a = 6378137.0; // Major semiaxis [m]
  var WGS84_b = 6356752.314245; // Minor semiaxis [m]
  var WGS84_f = 1 / 298.257223563; // Flattening [m]

  var An = WGS84_a * WGS84_a * Math.cos(lat);
  var Bn = WGS84_b * WGS84_b * Math.sin(lat);
  var Ad = WGS84_a * Math.cos(lat);
  var Bd = WGS84_b * Math.sin(lat);

  var result = Math.sqrt((An * An + Bn * Bn) / (Ad * Ad + Bd * Bd));

  unit = (unit == undefined) ? u.Geolocation.Unit['M'] : unit;
  return u.Geolocation.convertUnits(result, u.Geolocation.Unit['M'], unit);
};

/**
 * FIXME: Untested
 * @param {u.Geolocation} location
 * @param {u.Geolocation.Unit} unit
 * @returns {u.Geolocation}
 */
u.Geolocation.convert = function(location, unit) {
  if (location['unit'] == unit) { return location; }

  var ratio = u.Geolocation.CONVERSION_TABLE[location['unit']][unit];

  return new u.Geolocation(
    location['lat'],
    location['lng'],
    location['accuracy'] * ratio,
    unit,
    location['zoom'],
    location['range'] == null ? location['range'] : location['range'] * ratio,
    location['alt'] == null ? location['alt'] : location['alt'] * ratio,
    location['altAccuracy'] == null ? location['altAccuracy'] : location['altAccuracy'] * ratio,
    location['heading'],
    location['speed'] == null ? location['speed'] : location['speed'] * ratio);
};

/**
 * FIXME: Untested
 * @param {number} units
 * @param {u.Geolocation.Unit} fromUnit
 * @param {u.Geolocation.Unit} toUnit
 * @returns {number}
 */
u.Geolocation.convertUnits = function(units, fromUnit, toUnit) {
  if (fromUnit == toUnit) { return units; }
  var ratio = u.Geolocation.CONVERSION_TABLE[fromUnit][toUnit];
  return units * ratio;
};

/**
 * FIXME: Untested
 * @param {number} pixels
 * @param {number} lat
 * @param {number} zoom
 * @param {u.Geolocation.Unit} [unit]
 * @returns {number}
 */
u.Geolocation.googleMapPixels2Distance = function(pixels, lat, zoom, unit) {
  var meters = pixels * (Math.cos(lat * Math.PI / 180) * 2 * Math.PI * 6378137) / (256 * (2 << zoom));
  if (unit == undefined) { return meters; }
  return u.Geolocation.convertUnits(meters, u.Geolocation.Unit['M'], unit);
};

/**
 * FIXME: Untested
 * @param {number} meters
 * @param {number} pixels
 * @param {number} lat
 * @returns {number}
 */
u.Geolocation.googleMapMetersPixels2Zoom = function(meters, pixels, lat) {
  // log2 exists in es6 but not earlier versions;
  var log2 = Math['log2'] || function (x) {
      x = Number(x);
      return Math.log(x) * Math.LOG2E;
    };
  return Math.floor(log2(pixels * (Math.cos(lat * Math.PI / 180) * 2 * Math.PI * 6378137)) - log2(meters) - 9);
};


/** @const {number} */
u.Geolocation.M2KM = 0.001;

/** @const {number} */
u.Geolocation.KM2M = 1000.0;

/** @const {number} */
u.Geolocation.M2MI = 0.000621371192237334;

/** @const {number} */
u.Geolocation.MI2M = 1609.3439999999999;

/** @const {number} */
u.Geolocation.M2FT = 3.28084;

/** @const {number} */
u.Geolocation.FT2M = 0.3048;

/** @const {number} */
u.Geolocation.KM2MI = u.Geolocation.KM2M * u.Geolocation.M2MI;

/** @const {number} */
u.Geolocation.MI2KM = u.Geolocation.MI2M * u.Geolocation.M2KM;

/** @const {number} */
u.Geolocation.KM2FT = u.Geolocation.KM2M * u.Geolocation.M2FT;

/** @const {number} */
u.Geolocation.FT2KM = u.Geolocation.FT2M * u.Geolocation.M2KM;

/** @const {number} */
u.Geolocation.MI2FT = 5280;

/** @const {number} */
u.Geolocation.FT2MI = 0.000189394;

/**
 * @const {Object.<u.Geolocation.Unit, Object.<u.Geolocation.Unit, number>>}
 */
u.Geolocation.CONVERSION_TABLE = {
  '2': {
    '2': 1,
    '1': u.Geolocation.M2KM,
    '0': u.Geolocation.M2MI,
    '3': u.Geolocation.M2FT
  },
  '1': {
    '2': u.Geolocation.KM2M,
    '1': 1,
    '0': u.Geolocation.KM2MI,
    '3': u.Geolocation.KM2FT
  },
  '0': {
    '2': u.Geolocation.MI2M,
    '1': u.Geolocation.MI2KM,
    '0': 1,
    '3': u.Geolocation.MI2FT
  },
  '3': {
    '2': u.Geolocation.FT2M,
    '1': u.Geolocation.FT2KM,
    '0': u.Geolocation.FT2MI,
    '3': 1
  }
};

/**
 * @const {Object.<u.Geolocation.UnitName, Object.<u.Geolocation.UnitName, number>>}
 */
u.Geolocation.CONVERSION_TABLE_S = {
  'm': {
    'm': 1,
    'km': u.Geolocation.M2KM,
    'mi': u.Geolocation.M2MI,
    'ft': u.Geolocation.M2FT
  },
  'km': {
    'm': u.Geolocation.KM2M,
    'km': 1,
    'mi': u.Geolocation.KM2MI,
    'ft': u.Geolocation.KM2FT
  },
  'mi': {
    'm': u.Geolocation.MI2M,
    'km': u.Geolocation.MI2KM,
    'mi': 1,
    'ft': u.Geolocation.MI2FT
  },
  'ft': {
    'm': u.Geolocation.FT2M,
    'km': u.Geolocation.FT2KM,
    'mi': u.Geolocation.FT2MI,
    'ft': 1
  }
};

/**
 * @enum {number}
 */
u.Geolocation.Unit = {
  'MI': 0,
  'KM': 1,
  'M': 2,
  'FT': 3
};

/**
 * @enum {string}
 */
u.Geolocation.UnitName = {
  '0': 'mi',
  '1': 'km',
  '2': 'm',
  '3': 'ft'
};

/**
 * @enum {string}
 */
u.Geolocation.UnitLongNameSg = {
  '0': 'mile',
  '1': 'kilometer',
  '2': 'meter',
  '3': 'foot'
};

/**
 * @enum {string}
 */
u.Geolocation.UnitLongNamePl = {
  '0': 'miles',
  '1': 'kilometers',
  '2': 'meters',
  '3': 'feet'
};

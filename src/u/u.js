/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/7/2015
 * Time: 5:40 PM
 */

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

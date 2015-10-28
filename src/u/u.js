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

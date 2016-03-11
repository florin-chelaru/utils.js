/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/7/2015
 * Time: 2:24 PM
 */

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

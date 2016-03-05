/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 3/4/2016
 * Time: 11:12 PM
 */

goog.provide('u.fast');

/**
 * @param {Array} arr
 * @param {function(*, (number|undefined)): *} callback
 * @returns {Array}
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
 * @returns {Array}
 */
u.fast.concat = function(arrays) {
  if (arrays.length == 1) { return arrays[0]; }
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

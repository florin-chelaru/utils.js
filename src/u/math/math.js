/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/10/2015
 * Time: 1:07 PM
 */

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

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

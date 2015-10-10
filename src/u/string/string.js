/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/10/2015
 * Time: 12:31 PM
 */

goog.provide('u.string');

/**
 * @param {string} text
 * @returns {string}
 */
u.string.capitalizeFirstLetter = function (text) {
  if (!text) { return text; }
  return text.charAt(0).toUpperCase() + text.slice(1);
};

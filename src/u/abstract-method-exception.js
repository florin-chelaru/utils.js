/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/19/2015
 * Time: 5:08 PM
 */

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

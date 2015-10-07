/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 8/27/2015
 * Time: 1:10 PM
 */

goog.provide('u.reflection.ReflectionException');

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

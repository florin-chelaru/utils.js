/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 7/20/2015
 * Time: 1:19 PM
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

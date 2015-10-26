/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/15/2015
 * Time: 10:13 AM
 */

goog.provide('u.async');
goog.require('u.array');
goog.require('u.reflection');

/**
 * @param {Array.<function(): Promise>} jobs
 * @param {boolean} [inOrder] If true, the jobs are executed in order, otherwise, in parallel
 * @returns {Promise}
 */
u.async.all = function(jobs, inOrder) {
  if (inOrder) {  return u.async.each(jobs, function(job) { return job(); }, inOrder); }
  return Promise.all(jobs.map(function(job) { return job(); }));
};

/**
 * @param {number} n
 * @param {function(number, (number|undefined)): Promise} iteration
 * @param {boolean} [inOrder]
 * @returns {Promise}
 */
u.async.for = function(n, iteration, inOrder) {
  return u.async.each(u.array.range(n), iteration, inOrder);
};

/**
 * @param {function(number): Promise} iteration
 * @returns {Promise}
 */
u.async.do = function(iteration) {
  return new Promise(function(resolve, reject) {
    var i = 0;
    var it = function() {
      return iteration(i++).then(function(condition) {
        return !condition || it();
      });
    };
    it().then(resolve);
  });
};

/**
 * @param {Array.<T>} items
 * @param {function(T, number): Promise} iteration
 * @param {boolean} [inOrder]
 * @returns {Promise}
 * @template T
 */
u.async.each = function(items, iteration, inOrder) {
  if (inOrder) {
    return new Promise(function(resolve, reject) {
      if (!items || !items.length) {
        resolve();
      }

      var d, remaining;
      d = new Array(items.length+1);
      d[0] = new Promise(function(resolve) { resolve(); });

      items.forEach(function(item, i) {
        d[i + 1] = d[i].then(function() { return iteration.call(null, item, i); });
      });

      d[items.length].then(resolve);
    });
  } else {
    return Promise.all(items.map(function(item, i) { return iteration(item, i); }));
  }
};

/**
 * @constructor
 * @template T
 */
u.async.Deferred = function() {
  /**
   * @type {Function}
   * @private
   */
  this._resolve = null;

  /**
   * @type {Function}
   * @private
   */
  this._reject = null;

  var self = this;

  /**
   * @type {Promise}
   * @private
   */
  this._promise = new Promise(function() { self._resolve = arguments[0]; self._reject = arguments[1]; });
};

/**
 * @param {T} [value]
 */
u.async.Deferred.prototype.resolve = function(value) {
  this._resolve.call(this._promise, value);
};

/**
 * @param {*} [reason]
 */
u.async.Deferred.prototype.reject = function(reason) {
  this._reject.call(this._promise, reason);
};

/**
 * @param {function((T|undefined))} [onFulfilled]
 * @param {function(*)} [onRejected]
 * @returns {Promise}
 */
u.async.Deferred.prototype.then = function(onFulfilled, onRejected) {
  return this._promise.then(onFulfilled, onRejected);
};

/**
 * @param {function(*)} onRejected
 * @returns {Promise}
 */
u.async.Deferred.prototype.catch = function(onRejected) {
  return this._promise.catch(onRejected);
};

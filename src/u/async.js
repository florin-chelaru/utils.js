/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/15/2015
 * Time: 10:13 AM
 */

goog.provide('u.async');
goog.require('u.array');
goog.require('goog.async.Deferred');
goog.require('u.reflection');

// For the uncompiled version, so our methods can find u.async.Deferred;
// In the compiled version, this is replaced by either the embedded or existing version of goog.async.Deferred (see
// /export/u/async.js for details).
Object.defineProperties(u.async, {
  Deferred: { get: function() { return goog.async.Deferred; }}
});

/**
 * @param {Array.<function(): goog.async.Deferred>} jobs
 * @param {boolean} [inOrder] If true, the jobs are executed in order, otherwise, in parallel
 * @returns {goog.async.Deferred}
 */
u.async.all = function(jobs, inOrder) {
  return u.async.each(jobs, function(job) {
    return job.call(null);
  }, inOrder);
};

/**
 * @param {number} n
 * @param {function(number, (number|undefined)): goog.async.Deferred} iteration
 * @param {boolean} [inOrder]
 * @returns {goog.async.Deferred}
 */
u.async.for = function(n, iteration, inOrder) {
  return u.async.each(u.array.range(n), iteration, inOrder);
};

/**
 * @param {Array.<T>} items
 * @param {function(T, (number|undefined)): goog.async.Deferred} iteration
 * @param {boolean} [inOrder]
 * @returns {goog.async.Deferred}
 * @template T
 */
u.async.each = function(items, iteration, inOrder) {
  var Deferred = u.reflection.evaluateFullyQualifiedTypeName('u.async.Deferred');
  var deferred = new Deferred();

  if (!items || !items.length) {
    deferred['callback']();
    return deferred;
  }

  var d, remaining;
  if (inOrder) {
    d = new Array(items.length+1);
    d[0] = new Deferred();
    d[0]['callback']();
  } else {
    remaining = items.length;
  }
  items.forEach(function(item, i) {
    if (inOrder) {
      d[i + 1] = d[i]['then'](function() { return iteration.call(null, item, i); });
    } else {
      iteration.call(null, item, i)
        ['then'](function() {
          --remaining;
          if (!remaining) { deferred['callback'](); }
        });
    }
  });

  if (inOrder) {
    d[items.length]['then'](function() { deferred['callback'](); });
  }

  return deferred;
};

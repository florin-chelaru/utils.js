/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/15/2015
 * Time: 10:13 AM
 */

goog.provide('u.async');
goog.require('u.array');
goog.require('goog.async.Deferred');
goog.require('u.reflection');

// The Google Closure compiler will embed a version of goog.async.Deferred into our library, but because it becomes
// compiled, this does not have the same name or method names as the original one. Because of this, and the fact that we
// do not want to enforce a dependency on the Google Closure library, we do the following: if the goog.async.Deferred
// class already exists in the environment, we will use that throughout our code. Otherwise, we use the embedded
// version.
Object.defineProperties(u.async, {
  'Deferred': { get: /** @type {function (this: Object)} */ (function() {
    if (!this._deferredCtor) {
      try {
        this._deferredCtor = u.reflection.evaluateFullyQualifiedTypeName('goog.async.Deferred');
      } catch (err) {
        this._deferredCtor = goog.async.Deferred;
        this._deferredCtor.prototype['then'] = goog.async.Deferred.prototype.then;
        this._deferredCtor.prototype['callback'] = goog.async.Deferred.prototype.callback;
        this._deferredCtor.prototype['chainDeferred'] = goog.async.Deferred.prototype.chainDeferred;
        this._deferredCtor.prototype['hasFired'] = goog.async.Deferred.prototype.hasFired;
      }
    }
    return this._deferredCtor;
  })}
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

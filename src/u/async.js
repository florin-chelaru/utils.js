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
      var initialResolve;
      d = new Array(items.length+1);
      d[0] = new Promise(function(resolve) { initialResolve = resolve; });
      initialResolve();

      items.forEach(function(item, i) {
        d[i + 1] = d[i].then(function() { return iteration.call(null, item, i); });
      });

      d[items.length].then(resolve);
    });
  } else {
    return Promise.all(items.map(function(item, i) { return iteration(item, i); }));
  }
};

/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/25/2015
 * Time: 7:35 PM
 */

goog.provide('u.Promise');

(function(window) {
  if ('Promise' in window) { return; }

  /**
   * @param {function(function(*), function(*))} resolver
   * @constructor
   */
  var PromisePolyfill = function(resolver) {
    if (typeof resolver != 'function') {
      throw new TypeError('Promise resolver ' + resolver + ' is not a function');
    }

    /**
     * @type {Array.<Function>}
     * @private
     */
    this._fulfilledCallbacks = [];

    /**
     * @type {Array.<Function>}
     * @private
     */
    this._rejectedCallbacks = [];

    /**
     * @type {boolean}
     * @private
     */
    this._resolved = false;

    /**
     * @type {boolean}
     * @private
     */
    this._rejected = false;

    /**
     * @type {*}
     * @private
     */
    this._resolvedVal = undefined;

    /**
     * @type {*}
     * @private
     */
    this._rejectedReason = undefined;

    var self = this;
    try {
      resolver(
        // Resolve
        function (value) {
          self._resolved = true;
          self._resolvedVal = value;
          self._callAllFulfilled(value);
        },
        // Reject
        function (reason) {
          self._rejected = true;
          self._rejectedReason = reason;
          self._callAllRejected(reason);
        });
    } catch (err) {
      self._callAllRejected(err);
    }
  };

  /**
   * @param {function(*)} [onFulfilled]
   * @param {function(*)} [onRejected]
   * @returns {PromisePolyfill}
   */
  PromisePolyfill.prototype['then'] = function (onFulfilled, onRejected) {
    var resolve, reject;
    var ret = new PromisePolyfill(function() { resolve = arguments[0]; reject = arguments[1]; });
    var fulfilledWrapper, rejectedWrapper;
    if (typeof onFulfilled == 'function') {
      fulfilledWrapper = function(value) {
        try {
          var next = onFulfilled.call(null, value);
          if (next instanceof PromisePolyfill) {
            next['then'](resolve, reject);
          } else {
            resolve(next);
          }
        } catch (err) {
          reject(err);
        }
      };
      this._fulfilledCallbacks.push(fulfilledWrapper);
    }
    if (typeof onRejected == 'function') {
      rejectedWrapper = function(reason) {
        try {
          var next = onRejected.call(null, reason);
          if (next instanceof PromisePolyfill) {
            next['then'](resolve, reject);
          } else {
            resolve(next);
          }
        } catch (err) {
          reject(err);
        }
      };
      this._rejectedCallbacks.push(rejectedWrapper);
    }

    var self = this;
    if (this._resolved) {
      setTimeout(function() { fulfilledWrapper.call(null, self._resolvedVal); }, 0);
    } else if (this._rejected) {
      setTimeout(function() { rejectedWrapper.call(null, self._rejectedReason); }, 0);
    }

    return ret;
  };

  /**
   * @param {function(*)} [onRejected]
   * @returns {PromisePolyfill}
   */
  PromisePolyfill.prototype['catch'] = function(onRejected) { return this['then'](undefined, onRejected); };

  /**
   * @param {T} value
   * @template T
   */
  PromisePolyfill.prototype._callAllFulfilled = function(value) {
    this._fulfilledCallbacks.forEach(function(callback) {
      setTimeout(function() {  console.log('calling resolve callback with value ' + value); callback.call(null, value); }, 0);
    });
    this._fulfilledCallbacks = [];
  };

  /**
   * @param {*} reason
   */
  PromisePolyfill.prototype._callAllRejected = function(reason) {
    this._rejectedCallbacks.forEach(function(callback) {
      setTimeout(function() {  callback.call(null, reason); }, 0);
    });
    this._rejectedCallbacks = [];
  };

  /**
   * @param {*} [value]
   * @returns {PromisePolyfill}
   */
  PromisePolyfill['resolve'] = function(value) { return new PromisePolyfill(function(resolve) { resolve(value); }); };

  /**
   * @param {*} [reason]
   * @returns {PromisePolyfill}
   */
  PromisePolyfill['reject'] = function(reason) { return new PromisePolyfill(function(resolve, reject) { reject(reason); }); };

  /**
   * @param {Array} promises
   * @returns {PromisePolyfill}
   */
  PromisePolyfill['all'] = function(promises) {
    if (!promises || !promises.length) { return PromisePolyfill['resolve'](); }
    return new PromisePolyfill(function(resolve, reject) {
      var ret = new Array(promises.length);
      var remaining = promises.length;
      promises.forEach(function(promise, i) {
        var p = (promise instanceof PromisePolyfill) ? promise : PromisePolyfill['resolve'](promise);
        p['then'](
          function(value) {
            ret[i] = value;
            --remaining;
            if (!remaining) { resolve(ret); }
          },
          function(reason) {
            reject(reason);
          });
      });
    });
  };

  window['Promise'] = PromisePolyfill;
})(this);

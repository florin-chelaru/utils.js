/**
* @license utils.js
* Copyright (c) 2015 Florin Chelaru
* License: MIT
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
* documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
* rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
* Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
* COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
* OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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


goog.provide('u.Event');

goog.require('u.EventListener');

/**
 * @param {{synchronous: (boolean|undefined), timeout: (function(Function, number)|undefined)}} [options]
 * @constructor
 * @template T
 */
u.Event = function(options) {

  /**
   * @type {boolean}
   * @private
   */
  this._synchronous = options ? !!options.synchronous : false;

  /**
   * @type {number}
   * @private
   */
  this._count = 0;

  /**
   * @type {Object.<number, u.EventListener.<T>>}
   * @private
   */
  this._listeners = {};

  /**
   * Set to true when in the notify() method, to avoid infinite loops.
   * This is only used when the events are synchronous
   * @type {boolean}
   * @private
   */
  this._firing = false;

  /**
   * @type {function(Function, number)}
   * @private
   */
  this._timeout = (options && options.timeout) ? options.timeout : setTimeout;
};

/**
 * @type {boolean}
 * @name u.Event#synchronous
 */
u.Event.prototype.synchronous;

/**
 * @type {boolean}
 * @name u.Event#firing
 */
u.Event.prototype.firing;

/**
 * Gets the number of listeners register for the event
 * @type {number}
 * @name u.Event#count
 */
u.Event.prototype.count;

Object.defineProperties(u.Event.prototype, {
  'synchronous': { get: /** @type {function (this:u.Event)} */ (function() { return this._synchronous; })},
  'firing': { get: /** @type {function (this:u.Event)} */ (function() { return this._firing; })},
  'count': { get: /** @type {function (this:u.Event)} */ (function() { return this._count; })}
});

/**
 * @param {u.EventListener.<T>|function(T)} listener
 * @param {Object} [thisArg]
 * @returns {u.EventListener.<T>}
 */
u.Event.prototype.addListener = function(listener, thisArg) {
  if (typeof(listener) == 'function') {
    listener = new u.EventListener(listener, thisArg);
  }

  if (!this._listeners[listener['id']]) { ++this._count; }
  this._listeners[listener['id']] = listener;

  return listener;
};

/**
 * @param {u.EventListener.<T>} listener
 */
u.Event.prototype.removeListener = function(listener) {
  if (!this._listeners[listener['id']]) { return; }

  delete this._listeners[listener['id']];
  --this._count;
};

/**
 * @param {T} [args]
 */
u.Event.prototype.fire = function(args) {
  if (this._firing) { return; }

  var self = this;
  var timeout = this._timeout;
  var synchronous = this._synchronous;
  var doFire = function() {
    if (self._count == 0) { return; }

    self._firing = synchronous;

    u.each(self._listeners, function(id, listener) {
      if (!synchronous) {
        timeout.call(null, function() {
          listener.fire(args);
        }, 0);
      } else {
        listener.fire(args);
      }
    });
  };

  if (synchronous) {
    doFire();
  } else {
    timeout.call(null, doFire, 0);
  }

  this._firing = false;
};


goog.provide('u.array');

/**
 * @param {Arguments|Array} args
 * @returns {Array}
 */
u.array.fromArguments = function(args) {
  return /** @type {Array} */ (Array.isArray(args) ? args : [].slice.apply(args));
};

/**
 * Creates an array of length n filled with value
 * @param {number} n
 * @param {*} value
 * @returns {Array}
 */
u.array.fill = function(n, value) {
  n = n || 0;
  var ret = new Array(n);
  for (var i = 0; i < n; ++i) { ret[i] = value; }
  return ret;
};

/**
 * Generates an array of consecutive numbers starting from start, or 0 if it's not defined
 * @param {number} n
 * @param {number} [start]
 * @returns {Array.<number>}
 */
u.array.range = function(n, start) {
  start = start || 0;
  n = n || 0;

  var result = new Array(n);
  for (var i = 0; i < n; ++i) {
    result[i] = i + start;
  }

  return result;
};

/**
 * Returns a new array where all elements are unique
 * Complexity is suboptimal: O(n^2); for strings and numbers,
 * it can be done faster, using a map
 * @param {Array} arr
 * @returns {Array}
 */
u.array.unique = function(arr) {
  return arr.reduce(function(result, item) {
    if (result.indexOf(item) < 0) { result.push(item); }
    return result;
  }, []);
};


goog.provide('u.Exception');

/**
 * @param {string} message
 * @param {Error} [innerException]
 * @constructor
 * @extends Error
 */
u.Exception = function(message, innerException) {
  /**
   * @type {Error}
   * @private
   */
  this._errorCore = new Error(message);

  /**
   * @type {Error}
   * @private
   */
  this._innerException = innerException || null;

  /**
   * @type {string}
   */
  this.message = this._errorCore.message;

  /**
   * @type {string}
   */
  this.name = 'Exception';
};

goog.inherits(u.Exception, Error);

Object.defineProperties(u.Exception.prototype, {
  /**
   * @property
   * @type {string}
   * @name u.Exception#stack
   */
  'stack': /** @type {string} */ ({
    get: /** @type {function (this:u.Exception): string} */ (function() { return this._errorCore.stack; })
  }),

  /**
   * @property
   * @type {Error}
   * @name u.Exception#innerException
   */
  'innerException': /** @type {Error} */ ({
    get: /** @type {function (this:u.Exception): Error} */ (function() { return this._innerException; })
  })
});


goog.provide('u.reflection');
goog.require('u.array');

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


/**
 * Evaluates the given string into a constructor for a type
 * @param {string} typeName
 * @param {Object} [context]
 * @returns {function(new: T)}
 * @template T
 */
u.reflection.evaluateFullyQualifiedTypeName = function(typeName, context) {
  var result;

  try {
    var namespaces = typeName.split('.');
    var func = namespaces.pop();
    var ctx = context || window;
    for (var i = 0; i < namespaces.length; ++i) {
      ctx = ctx[namespaces[i]];
    }
    result = ctx[func];
  } catch (error) {
    throw new u.reflection.ReflectionException('Unknown type name: ' + typeName, error);
  }

  if (typeof(result) !== 'function') {
    throw new u.reflection.ReflectionException('Unknown type name: ' + typeName);
  }

  return result;
};

/**
 * Applies the given constructor to the given parameters and creates
 * a new instance of the class it defines
 * @param {function(new: T)} ctor
 * @param {Array|Arguments} params
 * @returns {T}
 * @template T
 */
u.reflection.applyConstructor = function(ctor, params) {
  return new (Function.prototype.bind.apply(ctor, [null].concat(u.array.fromArguments(params))));
};

/**
 * Wraps given type around the given object, so the object's prototype matches the one of the type
 * @param {Object} o
 * @param {function(new: T)} type
 * @returns {T}
 * @template T
 */
u.reflection.wrap = function(o, type) {
  //o.__proto__ = type.prototype;
  //return o;

  var props = {};
  for (var p in o) {
    if (!o.hasOwnProperty(p)) { continue; }
    (function(p) {
      props[p] = {
        get: function() { return o[p]; },
        set: function(value) { o[p] = value; }
      };
    })(p);
  }

  return Object.create(type.prototype, props);
};


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


goog.provide('u.UnimplementedException');

goog.require('u.Exception');

/**
 * @param {string} message
 * @param {Error} [innerException]
 * @constructor
 * @extends u.Exception
 */
u.UnimplementedException = function(message, innerException) {
  u.Exception.apply(this, arguments);

  /**
   * @type {string}
   */
  this.name = 'UnimplementedException';
};

goog.inherits(u.UnimplementedException, u.Exception);


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


goog.provide('u.Geolocation');

/**
 * @param {number} [lat]
 * @param {number} [lng]
 * @param {number} [zoom]
 * @param {number} [range]
 * @constructor
 */
u.Geolocation = function(lat, lng, zoom, range) {
  /**
   * @type {number}
   */
  this['lat'] = lat || 0;

  /**
   * @type {number}
   */
  this['lng'] = lng || 0;

  /**
   * @type {number}
   */
  this['zoom'] = zoom || 0;

  /**
   * @type {number}
   */
  this['range'] = range || 0;
};

/**
 * @param {u.Geolocation|{lat: number, lng: number, zoom: number}} other
 */
u.Geolocation.prototype.equals = function(other) {
  if (other == undefined) { return false; }
  return this['lat'] == other['lat'] && this['lng'] == other['lng'] && this['zoom'] == other['zoom'] && this['range'] == other['range'];
};


goog.provide('u.string');

/**
 * @param {string} text
 * @returns {string}
 */
u.string.capitalizeFirstLetter = function (text) {
  if (!text) { return text; }
  return text.charAt(0).toUpperCase() + text.slice(1);
};


goog.provide('u');

/**
 * @param {Array|Object.<number|string, *>} obj
 * @param {function((number|string), *)} callback
 * @returns {Array|Object}
 */
u.each = function(obj, callback) {
  if (obj == undefined) { return obj; }

  var i;
  if (Array.isArray(obj)) {
    for (i = 0; i < obj.length; ++i) {
      if (callback.call(obj[i], i, obj[i]) === false) { break; }
    }
  } else {
    for (i in obj) {
      if (callback.call(obj[i], i, obj[i]) === false) { break; }
    }
  }

  return obj;
};

/**
 * @param {Array.<T>|Object.<number|string, T>} obj
 * @param {function(T, (number|string|undefined)): V} callback
 * @param {Object} [thisArg]
 * @returns {Array.<V>}
 * @template T, V
 */
u.map = function(obj, callback, thisArg) {
  if (obj == undefined) { return []; }

  if (Array.isArray(obj)) { return obj.map(callback); }

  //var each = window['u']['each'];

  var ret = [];
  u.each(obj, function(k, v) {
    ret.push(callback.call(thisArg, v, k));
  });

  return ret;
};

/**
 * Makes a shallow copy of the given object or array
 * @param {Object|Array} obj
 * @returns {Object|Array}
 */
u.copy = function(obj) {
  if (obj == undefined) { return obj; }
  if (Array.isArray(obj)) { return obj.slice(); }
  var ret = {};
  u.each(obj, function(k, v) { ret[k] = v; });
  return ret;
};

/**
 * Extends the properties of dst with those of the other arguments of the function;
 * values corresponding to common keys are overriden.
 * @param {Object} dst
 * @param {...Object} src
 * @returns {Object}
 */
u.extend = function(dst, src) {
  if (arguments.length <= 1) { return dst; }
  for (var i = 1; i < arguments.length; ++i) {
    var s = arguments[i];
    for (var key in s) {
      if (!s.hasOwnProperty(key)) { continue; }
      dst[key] = s[key];
    }
  }

  return dst;
};

/**
 * @const {string}
 */
u.CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * @param {number} size
 * @returns {string}
 */
u.generatePseudoGUID = function(size) {
  var chars = u.CHARS;
  var result = '';

  for (var i = 0; i < size; ++i) {
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  }

  return result;
};

/**
 * Lightweight version of ajax GET request with minimal error handling
 * @param {string} uri
 * @returns {Promise}
 */
u.httpGet = function(uri) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', uri, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status !== 200) {
          reject('Request failed with error code ' + xhr.status);
        } else {
          resolve(xhr.responseText);
        }
      }
    };
    xhr.send();
  });
};

/**
 * @param {{uri: (string|undefined), content: (string|undefined)}} opts
 * @returns {Promise} Promise.<Object.<string, string>>
 */
u.parseLessConsts = function(opts) {
  return new Promise(function(resolve, reject) {
    if (!opts || (!opts['content'] && !opts['uri'])) { resolve({}); return; }
    if (!opts['content']) {
      u.httpGet(opts['uri'])
        .then(function(content) {
          return u.parseLessConsts({content: content});
        })
        .then(resolve);
      return;
    }

    var pairs = opts['content'].split(';')
      .filter(function(line) { return line.trim().length > 0; })
      .map(function(line) {
        return line.trim().split(':').map(function(token) { return token.trim(); })});
    var ret = {};
    pairs.forEach(function(pair) { ret[pair[0].substr(1)] = pair[1]; });
    resolve(ret);
  });
};


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
    setTimeout(function() {
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
    }, 0);
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


goog.provide('u.TimeSpan');

goog.require('u');

/**
 * @param {number} milliseconds Must be positive
 * @constructor
 */
u.TimeSpan = function(milliseconds) {
  if (milliseconds < 0) { milliseconds = 0; }

  /**
   * @type {number}
   * @private
   */
  this._totalMilliseconds = milliseconds;

  /**
   * @type {?number}
   * @private
   */
  this._totalDays = null;

  /**
   * @type {?number}
   * @private
   */
  this._totalHours = null;

  /**
   * @type {?number}
   * @private
   */
  this._totalMinutes = null;

  /**
   * @type {?number}
   * @private
   */
  this._totalSeconds = null;


  /**
   * @type {?number}
   * @private
   */
  this._days = null;

  /**
   * @type {?number}
   * @private
   */
  this._hours = null;

  /**
   * @type {?number}
   * @private
   */
  this._minutes = null;

  /**
   * @type {?number}
   * @private
   */
  this._seconds = null;

  /**
   * @type {?number}
   * @private
   */
  this._milliseconds = null;
};

/**
 * @constant {number}
 */
u.TimeSpan.MS_IN_SECOND = 1000;

/**
 * @constant {number}
 */
u.TimeSpan.MS_IN_MINUTE = 60 * u.TimeSpan.MS_IN_SECOND;

/**
 * @constant {number}
 */
u.TimeSpan.MS_IN_HOUR = 60 * u.TimeSpan.MS_IN_MINUTE;

/**
 * @constant {number}
 */
u.TimeSpan.MS_IN_DAY = 24 * u.TimeSpan.MS_IN_HOUR;

/**
 * @returns {number}
 */
u.TimeSpan.prototype.days = function() {
  if (this._days == null) { this._days = Math.floor(this.totalDays()); }
  return this._days;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.hours = function() {
  if (this._hours == null) {
    this._hours = Math.floor((this.totalDays() - this.days()) * 24);
  }
  return this._hours;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.minutes = function() {
  if (this._minutes == null) {
    this._minutes = Math.floor((this.totalHours() - Math.floor(this.totalHours())) * 60);
  }
  return this._minutes;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.seconds = function() {
  if (this._seconds == null) {
    this._seconds = Math.floor((this.totalMinutes() - Math.floor(this.totalMinutes())) * 60);
  }
  return this._seconds;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.milliseconds = function() {
  if (this._milliseconds == null) {
    this._milliseconds = this._totalMilliseconds % 1000;
  }
  return this._milliseconds;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalDays = function() {
  if (this._totalDays == null) {
    this._totalDays = this._totalMilliseconds / u.TimeSpan.MS_IN_DAY;
  }
  return this._totalDays;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalHours = function() {
  if (this._totalHours == null) {
    this._totalHours = this._totalMilliseconds / u.TimeSpan.MS_IN_HOUR;
  }
  return this._totalHours;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalMinutes = function() {
  if (this._totalMinutes == null) {
    this._totalMinutes = this._totalMilliseconds / u.TimeSpan.MS_IN_MINUTE;
  }
  return this._totalMinutes;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalSeconds = function() {
  if (this._totalSeconds == null) {
    this._totalSeconds = this._totalMilliseconds / u.TimeSpan.MS_IN_SECOND;
  }
  return this._totalSeconds;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalMilliseconds = function() { return this._totalMilliseconds; };

/**
 * TODO: Add a formatting parameter
 * @override
 * @returns {string}
 */
u.TimeSpan.prototype.toString = function() {
  var ret = '';
  if (this.days() > 0) {
    if (this.days() > 1) { ret += this.days() + ' days'; }
    else { ret += 'one day'}
  }

  if (this.hours() > 0) {
    if (ret) { ret += ', '; }
    if (this.hours() > 1) { ret += this.hours() + ' hours'; }
    else { ret += 'one hour'; }
  }

  if (this.minutes() > 0) {
    if (ret) { ret += ' and '; }
    if (this.minutes() > 1) { ret += this.minutes() + ' minutes'; }
    else { ret += 'one minute'; }
  } else if (!ret) {
    ret += 'less than a minute';
  }

  return u.string.capitalizeFirstLetter(ret);
};



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

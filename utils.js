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


goog.provide('u.reflection');

goog.require('u.reflection.ReflectionException');
goog.require('u.array');

/**
 * Evaluates the given string into a constructor for a type
 * @param {string} typeName
 * @returns {?function(new: T)}
 * @template T
 */
u.reflection.evaluateFullyQualifiedTypeName = function(typeName) {
  var result;

  try {
    var namespaces = typeName.split('.');
    var func = namespaces.pop();
    var context = window;
    for (var i = 0; i < namespaces.length; ++i) {
      context = context[namespaces[i]];
    }
    result = context[func];
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


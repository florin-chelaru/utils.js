/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 8/27/2015
 * Time: 11:59 AM
 */

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

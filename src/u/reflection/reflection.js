/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 8/27/2015
 * Time: 11:59 AM
 */

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


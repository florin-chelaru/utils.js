/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/15/2015
 * Time: 10:13 AM
 */

goog.require('u.async');
goog.require('u.reflection');

// The Google Closure compiler will embed a version of goog.async.Deferred into our library, but because it becomes
// compiled, this does not have the same name or methods as the original one. Because of this, and the fact that we do
// not want to enforce a dependency on the Google Closure library, we do the following: if the goog.async.Deferred class
// already exists in the environment, we will use that throughout our code. Otherwise, we use the embedded version.

goog.require('goog.async.Deferred');

/*var Deferred = null;
try {
  // Try to use the version of goog.async.Deferred present in the environment
  Deferred = u.reflection.evaluateFullyQualifiedTypeName('goog.async.Deferred');
} catch (err) {
  // goog.async.Deferred is not present in the environment, so we will use the version embedded in this library
  Deferred = goog.async.Deferred;

  // We export the most commonly used methods in the Deferred class; in the future, if other such methods turn out to be
  // needed, we can export them here as well.
  goog.exportProperty(Deferred.prototype, 'callback', Deferred.prototype.callback);
  goog.exportProperty(Deferred.prototype, 'then', Deferred.prototype.then);
  goog.exportProperty(Deferred.prototype, 'chainDeferred', Deferred.prototype.chainDeferred);
  goog.exportProperty(Deferred.prototype, 'hasFired', Deferred.prototype.hasFired);
  // TODO: Add other methods of interest

  // The same goes for the Promise class, that does not need to be declared explicitly
  goog.exportProperty(goog.Promise.prototype, 'then', goog.Promise.prototype.then);
  // TODO: Add other methods of interest
}*/

goog.exportSymbol('u.async', u.async);
goog.exportSymbol('u.async.all', u.async.all);
goog.exportSymbol('u.async.for', u.async.for);
goog.exportSymbol('u.async.each', u.async.each);

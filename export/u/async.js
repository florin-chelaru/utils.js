/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/15/2015
 * Time: 10:13 AM
 */

goog.require('u.async');
goog.require('u.reflection');

goog.exportSymbol('u.async.all', u.async.all);
goog.exportSymbol('u.async.for', u.async.for);
goog.exportSymbol('u.async.each', u.async.each);
goog.exportSymbol('u.async.do', u.async.do);

goog.exportSymbol('u.async.Deferred', u.async.Deferred);
goog.exportProperty(u.async.Deferred.prototype, 'resolve', u.async.Deferred.prototype.resolve);
goog.exportProperty(u.async.Deferred.prototype, 'reject', u.async.Deferred.prototype.reject);
goog.exportProperty(u.async.Deferred.prototype, 'then', u.async.Deferred.prototype.then);
goog.exportProperty(u.async.Deferred.prototype, 'catch', u.async.Deferred.prototype.catch);
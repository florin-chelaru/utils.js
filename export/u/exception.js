/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/28/2015
 * Time: 5:05 PM
 */

goog.require('u.Exception');

goog.exportSymbol('u.Exception', u.Exception);

if (Object.getOwnPropertyDescriptor(u.Exception.prototype, 'myprop') == undefined) {
  Object.defineProperty(u.Exception.prototype, 'myprop', {
    configurable: true,
    enumerable: true,
    get: /** @type {function (this:u.Exception)} */ (function() { return this.myprop; }),
    set: /** @type {function (this:u.Exception)} */ (function(value) { this.myprop = value; })
  });
}

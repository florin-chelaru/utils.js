/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 7/20/2015
 * Time: 1:13 PM
 */

goog.require('u.Event');

goog.exportSymbol('u.Event', u.Event);

goog.exportProperty(u.Event.prototype, 'addListener', u.Event.prototype.addListener);
goog.exportProperty(u.Event.prototype, 'removeListener', u.Event.prototype.removeListener);
goog.exportProperty(u.Event.prototype, 'fire', u.Event.prototype.fire);

/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 1/10/2016
 * Time: 11:52 AM
 */

goog.require('u.QuadTree');

goog.exportSymbol('u.QuadTree', u.QuadTree);

goog.exportProperty(u.QuadTree.prototype, 'insert', u.QuadTree.prototype.insert);
goog.exportProperty(u.QuadTree.prototype, 'collisions', u.QuadTree.prototype.collisions);
goog.exportProperty(u.QuadTree.prototype, 'overlaps', u.QuadTree.prototype.overlaps);
goog.exportProperty(u.QuadTree.prototype, 'leaves', u.QuadTree.prototype.leaves);
goog.exportProperty(u.QuadTree.prototype, 'values', u.QuadTree.prototype.values);
goog.exportProperty(u.QuadTree.prototype, 'items', u.QuadTree.prototype.items);

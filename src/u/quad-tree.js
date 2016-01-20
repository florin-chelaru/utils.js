/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 1/10/2016
 * Time: 11:52 AM
 */

goog.provide('u.QuadTree');

/**
 * @param {number} x Offset
 * @param {number} y Offset
 * @param {number} w Width
 * @param {number} h Height
 * @param {number} minQuadrantRatio
 * @param {number} maxQuadrantCapacity
 * @constructor
 */
u.QuadTree = function(x, y, w, h, minQuadrantRatio, maxQuadrantCapacity) {
  /**
   * @type {number}
   * @private
   */
  this._x = x;

  /**
   * @type {number}
   * @private
   */
  this._y = y;

  /**
   * @type {number}
   * @private
   */
  this._w = w;

  /**
   * @type {number}
   * @private
   */
  this._h = h;

  /**
   * Convert v between x and x+w to v' between 0 and 1
   * @type {function(number):number}
   * @private
   */
  this._normX = function(v) { return (v - x) / w; };

  /**
   * Convert v between 0 and 1 to v' between x and x+w
   * @type {function(number):number}
   * @private
   */
  this._scaleX = function(v) { return v * w + x; };

  /**
   * Convert v between y and y+h to v' between 0 and 1
   * @type {function(number):number}
   * @private
   */
  this._normY = function(v) { return (v - y) / h; };

  /**
   * Convert v between 0 and 1 to v' between x and y+h
   * @type {function(number):number}
   * @private
   */
  this._scaleY = function(v) { return v * h + y; };

  /**
   * @type {function(number):number}
   * @private
   */
  this._normW = function(v) { return v / w; };

  /**
   * Convert v between 0 and 1 to v' between 0 and w
   * @type {function(number):number}
   * @private
   */
  this._scaleW = function(v) { return v * w; };

  /**
   * @type {function(number):number}
   * @private
   */
  this._normH = function(v) { return v / h; };

  /**
   * Convert v between 0 and 1 to v' between 0 and h
   * @type {function(number):number}
   * @private
   */
  this._scaleH = function(v) { return v * h; };

  /**
   * @type {number}
   * @private
   */
  this._count = 0;

  /**
   * @type {number}
   * @private
   */
  this._minQuadrantRatio = minQuadrantRatio;

  /**
   * @type {number}
   * @private
   */
  this._maxQuadrantCapacity = maxQuadrantCapacity;

  /**
   * @type {u.QuadTree.Node}
   */
  this._root = new u.QuadTree.Node(0, 0, 1);
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {*} [value]
 */
u.QuadTree.prototype.insert = function(x, y, w, h, value) {
  this._insert(this._root, new u.QuadTree.Item(
    this._normX(x),
    this._normY(y),
    this._normW(w),
    this._normH(h),
    value));

  ++this._count;
};

/**
 * @param {u.QuadTree.Node} node
 * @param {u.QuadTree.Item} item
 * @private
 */
u.QuadTree.prototype._insert = function(node, item) {
  if (node.ne != null) {
    var quad = this._getQuadrant(node, item);

    if (quad != null) {
      this._insert(quad, item);
      return;
    }
  }

  node.items.push(item);

  if (node.items.length > this._maxQuadrantCapacity && node.size * 0.5 >= this._minQuadrantRatio) {
    if (node.ne == null) {
      this._split(node);

      var i = 0;
      while (i < node.items.length) {
        var quad = this._getQuadrant(node, node.items[i]);
        if (quad != null) {
          this._insert(quad, node.items.splice(i, 1)[0]);
        } else {
          ++i;
        }
      }
    }
  }
};

/**
 * Splits the node into 4 subnodes
 * @param {u.QuadTree.Node} node
 * @private
 */
u.QuadTree.prototype._split = function(node) {
  var size = node.size * 0.5;
  var x = node.x;
  var y = node.y;

  node.ne = new u.QuadTree.Node(x + size, y, size, node);
  node.se = new u.QuadTree.Node(x + size, y + size, size, node);
  node.sw = new u.QuadTree.Node(x, y + size, size, node);
  node.nw = new u.QuadTree.Node(x, y, size, node);
};

/**
 * Determine which node the object belongs to. null means
 * object cannot completely fit within a child node and is part
 * of the parent node
 * @param {u.QuadTree.Node} node
 * @param {u.QuadTree.Item} item
 * @returns {u.QuadTree.Node}
 * @private
 */
u.QuadTree.prototype._getQuadrant = function(node, item) {
  var ret = null;
  var mx = node.x + node.size * 0.5;
  var my = node.y + node.size * 0.5;

  // Object can completely fit within the top quadrants
  var topQuadrant = (item.y < my && item.y + item.h < my);
  
  // Object can completely fit within the bottom quadrants
  var bottomQuadrant = (item.y > my);

  if (item.x < mx && item.x + item.w < mx) {
    // Object can completely fit within the left quadrants
    if (topQuadrant) {
      ret = node.nw;
    } else if (bottomQuadrant) {
      ret = node.sw;
    }
  } else if (item.x > mx) {
    // Object can completely fit within the right quadrants
    if (topQuadrant) {
      ret = node.ne;
    } else if (bottomQuadrant) {
      ret = node.se;
    }
  }

  return ret;
};

/**
 * @param {number} x
 * @param {number} y
 * @returns {Array.<u.QuadTree.Item>}
 */
u.QuadTree.prototype.collisions = function(x, y) {
  var point = {
    'x': this._normX(x),
    'y': this._normY(y)
  };

  return this._computeCollisions(this._root, point, []);
};

/**
 *
 * @param {u.QuadTree.Node} node
 * @param {{x: number, y: number}} p
 * @param {Array.<u.QuadTree.Item>} ret
 * @returns {Array.<u.QuadTree.Item>}
 * @private
 */
u.QuadTree.prototype._computeCollisions = function(node, p, ret) {
  var self = this;
  Array.prototype.push.apply(ret, node.items
    .filter(function(item) {
      return item.x <= p['x'] &&
          item.x + item.w > p['x'] &&
          item.y <= p['y'] &&
          item.y + item.h > p['y'];
    })
    .map(function(item) {
      return {'x': self._scaleX(item.x), 'y': self._scaleY(item.y), 'w': self._scaleW(item.w), 'h': self._scaleH(item.h), 'value': item.value};
    })
  );

  if (node.ne == null) { return ret; }

  if (node.nw.x + node.nw.size > p['x']) {
    if (node.nw.y + node.nw.size > p['y']) {
      return this._computeCollisions(node.nw, p, ret);
    } else {
      return this._computeCollisions(node.sw, p, ret);
    }
  } else {
    if (node.ne.y + node.ne.size > p['y']) {
      return this._computeCollisions(node.ne, p, ret);
    } else {
      return this._computeCollisions(node.se, p, ret);
    }
  }
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @returns {Array.<{x: number, y: number, w: number, h: number, value: *}>}
 */
u.QuadTree.prototype.overlaps = function(x, y, w, h) {
  var item = new u.QuadTree.Item(
    this._normX(x),
    this._normY(y),
    this._normW(w),
    this._normH(h));

  return this._computeOverlaps(this._root, item, []);
};

/**
 * @param {u.QuadTree.Node} node
 * @param {u.QuadTree.Item} item
 * @param {Array.<{x: number, y: number, w: number, h: number, value: *}>} ret
 * @returns {Array.<{x: number, y: number, w: number, h: number, value: *}>}
 * @private
 */
u.QuadTree.prototype._computeOverlaps = function(node, item, ret) {
  var self = this;
  Array.prototype.push.apply(ret, node.items
    .filter(function(it) {
      return it.x < item.x + item.w &&
        it.x + it.w > item.x &&
        it.y < item.y + item.h &&
        it.y + it.h > item.y;
    })
    .map(function(it) {
      return {'x': self._scaleX(it.x), 'y': self._scaleY(it.y), 'w': self._scaleW(it.w), 'h': self._scaleH(it.h), 'value': it.value};
    })
  );

  if (node.ne == null) { return ret; }

  var quad = this._getQuadrant(node, item);
  if (quad != null) { return this._computeOverlaps(quad, item, ret); }

  var mx = node.x + node.size * 0.5;
  var my = node.y + node.size * 0.5;

  // Object can completely fit within the top quadrants
  if (item.y + item.h < my) {
    this._computeOverlaps(node.nw, item, ret);
    return this._computeOverlaps(node.ne, item, ret);
  }

  // Object can completely fit within the bottom quadrants
  if (item.y > my) {
    this._computeOverlaps(node.sw, item, ret);
    return this._computeOverlaps(node.se, item, ret);
  }

  // Object can completely fit within the left quadrants
  if (item.x + item.w < mx) {
    this._computeOverlaps(node.nw, item, ret);
    return this._computeOverlaps(node.sw, item, ret);
  }

  // Object can completely fit within the right quadrants
  if (item.x > mx) {
    this._computeOverlaps(node.ne, item, ret);
    return this._computeOverlaps(node.se, item, ret);
  }

  this._computeOverlaps(node.ne, item, ret);
  this._computeOverlaps(node.se, item, ret);
  this._computeOverlaps(node.sw, item, ret);
  return this._computeOverlaps(node.nw, item, ret);
};

/**
 * @returns {Array.<{x: number, y: number, w: number, h: number, items: Array}>}
 */
u.QuadTree.prototype.leaves = function() {
  return this._computeLeaves(this._root, []);
};

/**
 * @param {u.QuadTree.Node} node
 * @param {Array.<{x: number, y: number, w: number, h: number, items: Array}>} ret
 * @returns {Array.<{x: number, y: number, w: number, h: number, items: Array}>}
 * @private
 */
u.QuadTree.prototype._computeLeaves = function(node, ret) {
  if (node.ne == null) {
    ret.push({
      'x': this._scaleX(node.x),
      'y': this._scaleY(node.y),
      'w': this._scaleW(node.size),
      'h': this._scaleH(node.size),
      'items': node.items
    });
    return ret;
  }

  this._computeLeaves(node.ne, ret);
  this._computeLeaves(node.se, ret);
  this._computeLeaves(node.sw, ret);
  this._computeLeaves(node.nw, ret);

  return ret;
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {u.QuadTree.Node} [parent]
 * @constructor
 */
u.QuadTree.Node = function(x, y, size, parent) {
  /**
   * @type {number}
   */
  this.x = x;

  /**
   * @type {number}
   */
  this.y = y;

  /**
   * @type {number}
   */
  this.size = size;

  /**
   * @type {u.QuadTree.Node|null}
   */
  this.parent = parent || null;

  /**
   * @type {u.QuadTree.Node|null}
   */
  this.ne = null;

  /**
   * @type {u.QuadTree.Node|null}
   */
  this.se = null;

  /**
   * @type {u.QuadTree.Node|null}
   */
  this.sw = null;

  /**
   * @type {u.QuadTree.Node|null}
   */
  this.nw = null;

  /**
   * @type {Array.<u.QuadTree.Item>}
   */
  this.items = [];
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {*} [value]
 * @constructor
 */
u.QuadTree.Item = function(x, y, w, h, value) {
  /**
   * @type {number}
   */
  this.x = x;

  /**
   * @type {number}
   */
  this.y = y;

  /**
   * @type {number}
   */
  this.w = w;

  /**
   * @type {number}
   */
  this.h = h;

  /**
   * @type {*}
   */
  this.value = value;
};

/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/11/2015
 * Time: 11:53 AM
 */

goog.provide('u.Geolocation');

/**
 * @param {number} lat
 * @param {number} lng
 * @param {number} [accuracy=0] The accuracy level of the latitude and longitude coordinates. It is specified in units and
 *   must be supported by all implementations. The value of the accuracy attribute must be a non-negative real number.
 * @param {u.Geolocation.Unit} [unit]
 * @param {number} [zoom] Google Maps zoom level
 * @param {number} [range] Radius in units around center; not to be confused with accuracy!
 * @param {number} [alt] In units. The height of the position, specified in units above the [WGS84] ellipsoid. If the
 *   implementation cannot provide altitude information, the value of this attribute must be null.
 * @param {number} [altAccuracy] In units. If the implementation cannot provide altitude information, the value of this
 *   attribute must be null. Otherwise, the value of the altitudeAccuracy attribute must be a non-negative real number.
 * @param {number} [heading] The direction of travel of the hosting device and is specified in degrees,
 *   where 0� ? heading < 360�, counting clockwise relative to the true north. If the implementation cannot provide
 *   heading information, the value of this attribute must be null. If the hosting device is stationary (i.e. the value
 *   of the speed attribute is 0), then the value of the heading attribute must be NaN.
 * @param {number} [speed] Denotes the magnitude of the horizontal component of the hosting device's current velocity
 *   and is specified in units per second. If the implementation cannot provide speed information, the value of this
 *   attribute must be null. Otherwise, the value of the speed attribute must be a non-negative real number.
 * @constructor
 */
u.Geolocation = function (lat, lng, accuracy, unit, zoom, range, alt, altAccuracy, heading, speed) {
  /**
   * @type {number}
   */
  this['lat'] = lat;

  /**
   * @type {number}
   */
  this['lng'] = lng;

  /**
   * @type {number}
   */
  this['range'] = (range == undefined) ? null : range;

  /**
   * @type {number}
   */
  this['accuracy'] = accuracy || 0;

  /**
   * @type {number}
   */
  this['zoom'] = (zoom == undefined) ? null : zoom;

  /**
   * @type {u.Geolocation.Unit}
   */
  this['unit'] = unit || u.Geolocation.Unit['M'];

  /**
   * @type {number}
   */
  this['alt'] = (alt == undefined) ? null : alt;

  /**
   * @type {number}
   */
  this['altAccuracy'] = (altAccuracy == undefined) ? null : altAccuracy;

  /**
   * @type {number}
   */
  this['heading'] = (heading == undefined) ? null : heading;

  /**
   * @type {number}
   */
  this['speed'] = (speed == undefined) ? null : speed;
};

/**
 * @param {u.Geolocation} [other]
 * @returns {boolean}
 */
u.Geolocation.prototype.equals = function(other) {
  if (other == undefined) { return false; }
  var g = (other instanceof u.Geolocation) ? other : new u.Geolocation(other['lat'], other['lng'], other['accuracy'], other['unit'], other['zoom'], other['range'], other['alt'], other['altAccuracy'], other['heading'], other['speed']);

  var converted = u.Geolocation.convert(g, this['unit']);
  return this['lat'] == converted['lat'] && this['lng'] == converted['lng'] && this['zoom'] == converted['zoom'] &&
    this['range'] == converted['range'] && this['accuracy'] == converted['accuracy'] && this['alt'] == converted['alt'] &&
    this['altAccuracy'] == converted['altAccuracy'] && this['heading'] == converted['heading'] && this['speed'] == converted['speed'];
};

/**
 * @returns {u.Geolocation}
 */
u.Geolocation.prototype.copy = function() {
  return new u.Geolocation(this['lat'], this['lng'], this['accuracy'], this['unit'], this['zoom'],
    this['range'], this['alt'], this['altAccuracy'], this['heading'], this['speed']);
};


/**
 * @license MIT License http://www.movable-type.co.uk/scripts/latlong.html
 */
/**
 * Returns the distance from ‘this’ point to destination point (using haversine formula).
 *
 * @param   {u.Geolocation|{lat: number, lng: number}} point - Latitude/longitude of destination point.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} Distance between this point and destination point, in same units as radius (meters by default).
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 *     var p2 = new LatLon(48.857, 2.351);
 *     var d = p1.distanceTo(p2); // 404.3 km
 */
u.Geolocation.prototype.distanceTo = function(point, radius) {
  radius = (radius === undefined) ? 6371010 : Number(radius);

  var R = radius;
  var phi1 = u.math.deg2rad(this['lat']),  lambda1 = u.math.deg2rad(this['lng']);
  var phi2 = u.math.deg2rad(point['lat']), lambda2 = u.math.deg2rad(point['lng']);
  var dphi = phi2 - phi1;
  var dlambda = lambda2 - lambda1;

  var a = Math.sin(dphi/2) * Math.sin(dphi/2)
    + Math.cos(phi1) * Math.cos(phi2)
    * Math.sin(dlambda/2) * Math.sin(dlambda/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * FIXME: Untested
 * Returns the destination point from ‘this’ point having travelled the given distance on the
 * given initial bearing (bearing normally varies around path followed).
 *
 * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
 * @param   {number} bearing - Initial bearing in degrees from north.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {u.Geolocation} Destination point.
 *
 * @example
 *     var p1 = new LatLon(51.4778, -0.0015);
 *     var p2 = p1.destinationPoint(7794, 300.7); // 51.5135°N, 000.0983°W
 */
u.Geolocation.prototype.destinationPoint = function(distance, bearing, radius) {
  radius = (radius === undefined) ? 6371010 : Number(radius);

  // see http://williams.best.vwh.net/avform.htm#LL

  var delta = Number(distance) / radius; // angular distance in radians
  var theta = u.math.deg2rad(Number(bearing));

  var phi1 = u.math.deg2rad(this['lat']);
  var lambda1 = u.math.deg2rad(this['lng']);

  var phi2 = Math.asin(Math.sin(phi1)*Math.cos(delta) + Math.cos(phi1)*Math.sin(delta)*Math.cos(theta));
  var x = Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2);
  var y = Math.sin(theta) * Math.sin(delta) * Math.cos(phi1);
  var lambda2 = lambda1 + Math.atan2(y, x);

  return new u.Geolocation(u.math.rad2deg(phi2), (u.math.rad2deg(lambda2)+540)%360-180, 0); // normalize to −180..+180°
};

/**
 * FIXME: Untested
 * @param {number} dist
 * @param {u.Geolocation.Unit} [unit]
 * @returns {{sw: u.Geolocation, ne:u.Geolocation}}
 */
u.Geolocation.prototype.boundingBox = function(dist, unit) {
  var MIN_LAT = -Math.PI / 2;
  var MAX_LAT = Math.PI / 2;
  var MIN_LNG = -Math.PI;
  var MAX_LNG = Math.PI;

  // Calculate the radius of the earth (spherical)
  var radius2 = u.Geolocation.getEarthRadiusWGS84(this['lat'], unit);

  // Angular dist in radians on a great circle
  var angular = dist / radius2;

  // Latitude and longitude in radians
  var radLat = u.math.deg2rad(this['lat']);
  var radLng = u.math.deg2rad(this['lng']);

  // Initial min and max
  var sLat = radLat - angular;
  var nLat = radLat + angular;
  var wLng = 0;
  var eLng = 0;

  if (sLat > MIN_LAT && nLat < MAX_LAT) {
    var deltaLng = Math.asin(Math.sin(angular) / Math.cos(radLat));

    wLng = radLng - deltaLng;
    if (wLng < MIN_LNG) { wLng += 2 * Math.PI; }

    eLng = radLng + deltaLng;
    if (eLng > MAX_LNG) { eLng -= 2 * Math.PI; }
  } else {
    // A pole is within the dist
    sLat = Math.max(sLat, MIN_LAT);
    nLat = Math.min(nLat, MAX_LAT);
    wLng = MIN_LNG;
    eLng = MAX_LNG;
  }

  return {
    'sw': new u.Geolocation(u.math.rad2deg(sLat), u.math.rad2deg(wLng), 0),
    'ne': new u.Geolocation(u.math.rad2deg(nLat), u.math.rad2deg(eLng), 0)
  };
};

/**
 * @license MIT License http://www.movable-type.co.uk/scripts/latlong.html
 */
/**
 * Computes the distance between the two given locations (using haversine formula) in meters.
 * @param {{lat: number, lng: number}} l1
 * @param {{lat: number, lng: number}} l2
 * @returns {number}
 */
u.Geolocation.distanceBetween = function(l1, l2) {
  var R = 6371010;
  var phi1 = u.math.deg2rad(l1['lat']), lambda1 = u.math.deg2rad(l1['lng']);
  var phi2 = u.math.deg2rad(l2['lat']), lambda2 = u.math.deg2rad(l2['lng']);
  var dphi = phi2 - phi1;
  var dlambda = lambda2 - lambda1;

  var a = Math.sin(dphi/2) * Math.sin(dphi/2)
    + Math.cos(phi1) * Math.cos(phi2)
    * Math.sin(dlambda/2) * Math.sin(dlambda/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * FIXME: Untested
 * Earth radius at a given lat, according to the WGS-84 ellipsoid figure
 * @param {number} lat The lat of the coordinate.
 * @param {u.Geolocation.Unit} [unit]
 */
u.Geolocation.getEarthRadiusWGS84 = function(lat, unit) {
  // http://en.wikipedia.org/wiki/Earth_radius

  var WGS84_a = 6378137.0; // Major semiaxis [m]
  var WGS84_b = 6356752.314245; // Minor semiaxis [m]
  var WGS84_f = 1 / 298.257223563; // Flattening [m]

  var An = WGS84_a * WGS84_a * Math.cos(lat);
  var Bn = WGS84_b * WGS84_b * Math.sin(lat);
  var Ad = WGS84_a * Math.cos(lat);
  var Bd = WGS84_b * Math.sin(lat);

  var result = Math.sqrt((An * An + Bn * Bn) / (Ad * Ad + Bd * Bd));

  unit = (unit == undefined) ? u.Geolocation.Unit['M'] : unit;
  return u.Geolocation.convertUnits(result, u.Geolocation.Unit['M'], unit);
};

/**
 * FIXME: Untested
 * @param {u.Geolocation} location
 * @param {u.Geolocation.Unit} unit
 * @returns {u.Geolocation}
 */
u.Geolocation.convert = function(location, unit) {
  if (location['unit'] == unit) { return location; }

  var ratio = u.Geolocation.CONVERSION_TABLE[location['unit']][unit];

  return new u.Geolocation(
    location['lat'],
    location['lng'],
    location['accuracy'] * ratio,
    unit,
    location['zoom'],
    location['range'] == null ? location['range'] : location['range'] * ratio,
    location['alt'] == null ? location['alt'] : location['alt'] * ratio,
    location['altAccuracy'] == null ? location['altAccuracy'] : location['altAccuracy'] * ratio,
    location['heading'],
    location['speed'] == null ? location['speed'] : location['speed'] * ratio);
};

/**
 * FIXME: Untested
 * @param {number} units
 * @param {u.Geolocation.Unit} fromUnit
 * @param {u.Geolocation.Unit} toUnit
 * @returns {number}
 */
u.Geolocation.convertUnits = function(units, fromUnit, toUnit) {
  if (fromUnit == toUnit) { return units; }
  var ratio = u.Geolocation.CONVERSION_TABLE[fromUnit][toUnit];
  return units * ratio;
};

/**
 * FIXME: Untested
 * @param {number} pixels
 * @param {number} lat
 * @param {number} zoom
 * @param {u.Geolocation.Unit} [unit]
 * @returns {number}
 */
u.Geolocation.googleMapPixels2Distance = function(pixels, lat, zoom, unit) {
  var meters = pixels * (Math.cos(lat * Math.PI / 180) * 2 * Math.PI * 6378137) / (256 * (2 << zoom));
  if (unit == undefined) { return meters; }
  return u.Geolocation.convertUnits(meters, u.Geolocation.Unit['M'], unit);
};

/**
 * FIXME: Untested
 * @param {number} meters
 * @param {number} pixels
 * @param {number} lat
 * @returns {number}
 */
u.Geolocation.googleMapMetersPixels2Zoom = function(meters, pixels, lat) {
  // log2 exists in es6 but not earlier versions;
  var log2 = Math['log2'] || function (x) {
      x = Number(x);
      return Math.log(x) * Math.LOG2E;
    };
  return Math.floor(log2(pixels * (Math.cos(lat * Math.PI / 180) * 2 * Math.PI * 6378137)) - log2(meters) - 9);
};


/** @const {number} */
u.Geolocation.M2KM = 0.001;

/** @const {number} */
u.Geolocation.KM2M = 1000.0;

/** @const {number} */
u.Geolocation.M2MI = 0.000621371192237334;

/** @const {number} */
u.Geolocation.MI2M = 1609.3439999999999;

/** @const {number} */
u.Geolocation.M2FT = 3.28084;

/** @const {number} */
u.Geolocation.FT2M = 0.3048;

/** @const {number} */
u.Geolocation.KM2MI = u.Geolocation.KM2M * u.Geolocation.M2MI;

/** @const {number} */
u.Geolocation.MI2KM = u.Geolocation.MI2M * u.Geolocation.M2KM;

/** @const {number} */
u.Geolocation.KM2FT = u.Geolocation.KM2M * u.Geolocation.M2FT;

/** @const {number} */
u.Geolocation.FT2KM = u.Geolocation.FT2M * u.Geolocation.M2KM;

/** @const {number} */
u.Geolocation.MI2FT = 5280;

/** @const {number} */
u.Geolocation.FT2MI = 0.000189394;

/**
 * @const {Object.<u.Geolocation.Unit, Object.<u.Geolocation.Unit, number>>}
 */
u.Geolocation.CONVERSION_TABLE = {
  '2': {
    '2': 1,
    '1': u.Geolocation.M2KM,
    '0': u.Geolocation.M2MI,
    '3': u.Geolocation.M2FT
  },
  '1': {
    '2': u.Geolocation.KM2M,
    '1': 1,
    '0': u.Geolocation.KM2MI,
    '3': u.Geolocation.KM2FT
  },
  '0': {
    '2': u.Geolocation.MI2M,
    '1': u.Geolocation.MI2KM,
    '0': 1,
    '3': u.Geolocation.MI2FT
  },
  '3': {
    '2': u.Geolocation.FT2M,
    '1': u.Geolocation.FT2KM,
    '0': u.Geolocation.FT2MI,
    '3': 1
  }
};

/**
 * @const {Object.<u.Geolocation.UnitName, Object.<u.Geolocation.UnitName, number>>}
 */
u.Geolocation.CONVERSION_TABLE_S = {
  'm': {
    'm': 1,
    'km': u.Geolocation.M2KM,
    'mi': u.Geolocation.M2MI,
    'ft': u.Geolocation.M2FT
  },
  'km': {
    'm': u.Geolocation.KM2M,
    'km': 1,
    'mi': u.Geolocation.KM2MI,
    'ft': u.Geolocation.KM2FT
  },
  'mi': {
    'm': u.Geolocation.MI2M,
    'km': u.Geolocation.MI2KM,
    'mi': 1,
    'ft': u.Geolocation.MI2FT
  },
  'ft': {
    'm': u.Geolocation.FT2M,
    'km': u.Geolocation.FT2KM,
    'mi': u.Geolocation.FT2MI,
    'ft': 1
  }
};

/**
 * @enum {number}
 */
u.Geolocation.Unit = {
  'MI': 0,
  'KM': 1,
  'M': 2,
  'FT': 3
};

/**
 * @enum {string}
 */
u.Geolocation.UnitName = {
  '0': 'mi',
  '1': 'km',
  '2': 'm',
  '3': 'ft'
};

/**
 * @enum {string}
 */
u.Geolocation.UnitLongNameSg = {
  '0': 'mile',
  '1': 'kilometer',
  '2': 'meter',
  '3': 'foot'
};

/**
 * @enum {string}
 */
u.Geolocation.UnitLongNamePl = {
  '0': 'miles',
  '1': 'kilometers',
  '2': 'meters',
  '3': 'feet'
};

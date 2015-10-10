/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 6/25/2015
 * Time: 6:32 PM
 */

goog.provide('u.TimeSpan');

goog.require('u');

/**
 * @param {number} milliseconds Must be positive
 * @constructor
 */
u.TimeSpan = function(milliseconds) {
  if (milliseconds < 0) { milliseconds = 0; }

  /**
   * @type {number}
   * @private
   */
  this._totalMilliseconds = milliseconds;

  /**
   * @type {?number}
   * @private
   */
  this._totalDays = null;

  /**
   * @type {?number}
   * @private
   */
  this._totalHours = null;

  /**
   * @type {?number}
   * @private
   */
  this._totalMinutes = null;

  /**
   * @type {?number}
   * @private
   */
  this._totalSeconds = null;


  /**
   * @type {?number}
   * @private
   */
  this._days = null;

  /**
   * @type {?number}
   * @private
   */
  this._hours = null;

  /**
   * @type {?number}
   * @private
   */
  this._minutes = null;

  /**
   * @type {?number}
   * @private
   */
  this._seconds = null;

  /**
   * @type {?number}
   * @private
   */
  this._milliseconds = null;
};

/**
 * @constant {number}
 */
u.TimeSpan.MS_IN_SECOND = 1000;

/**
 * @constant {number}
 */
u.TimeSpan.MS_IN_MINUTE = 60 * u.TimeSpan.MS_IN_SECOND;

/**
 * @constant {number}
 */
u.TimeSpan.MS_IN_HOUR = 60 * u.TimeSpan.MS_IN_MINUTE;

/**
 * @constant {number}
 */
u.TimeSpan.MS_IN_DAY = 24 * u.TimeSpan.MS_IN_HOUR;

/**
 * @returns {number}
 */
u.TimeSpan.prototype.days = function() {
  if (this._days == null) { this._days = Math.floor(this.totalDays()); }
  return this._days;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.hours = function() {
  if (this._hours == null) {
    this._hours = Math.floor((this.totalDays() - this.days()) * 24);
  }
  return this._hours;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.minutes = function() {
  if (this._minutes == null) {
    this._minutes = Math.floor((this.totalHours() - Math.floor(this.totalHours())) * 60);
  }
  return this._minutes;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.seconds = function() {
  if (this._seconds == null) {
    this._seconds = Math.floor((this.totalMinutes() - Math.floor(this.totalMinutes())) * 60);
  }
  return this._seconds;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.milliseconds = function() {
  if (this._milliseconds == null) {
    this._milliseconds = this._totalMilliseconds % 1000;
  }
  return this._milliseconds;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalDays = function() {
  if (this._totalDays == null) {
    this._totalDays = this._totalMilliseconds / u.TimeSpan.MS_IN_DAY;
  }
  return this._totalDays;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalHours = function() {
  if (this._totalHours == null) {
    this._totalHours = this._totalMilliseconds / u.TimeSpan.MS_IN_HOUR;
  }
  return this._totalHours;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalMinutes = function() {
  if (this._totalMinutes == null) {
    this._totalMinutes = this._totalMilliseconds / u.TimeSpan.MS_IN_MINUTE;
  }
  return this._totalMinutes;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalSeconds = function() {
  if (this._totalSeconds == null) {
    this._totalSeconds = this._totalMilliseconds / u.TimeSpan.MS_IN_SECOND;
  }
  return this._totalSeconds;
};

/**
 * @returns {number}
 */
u.TimeSpan.prototype.totalMilliseconds = function() { return this._totalMilliseconds; };

/**
 * TODO: Add a formatting parameter
 * @override
 * @returns {string}
 */
u.TimeSpan.prototype.toString = function() {
  var ret = '';
  if (this.days() > 0) {
    if (this.days() > 1) { ret += this.days() + ' days'; }
    else { ret += 'one day'}
  }

  if (this.hours() > 0) {
    if (ret) { ret += ', '; }
    if (this.hours() > 1) { ret += this.hours() + ' hours'; }
    else { ret += 'one hour'; }
  }

  if (this.minutes() > 0) {
    if (ret) { ret += ' and '; }
    if (this.minutes() > 1) { ret += this.minutes() + ' minutes'; }
    else { ret += 'one minute'; }
  } else if (!ret) {
    ret += 'less than a minute';
  }

  return u.string.capitalizeFirstLetter(ret);
};


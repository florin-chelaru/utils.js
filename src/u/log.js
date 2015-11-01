/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 11/1/2015
 * Time: 5:10 PM
 */

goog.provide('u.log');

/**
 * @param {...} args
 */
u.log.info = function(args) {
  var verbose = u.log['VERBOSE'];
  if (verbose != 'info') { return; }

  var logger = u.log['LOGGER'] || console;
  logger.info.apply(logger, arguments);
};

/**
 * @param {...} args
 */
u.log.warn = function(args) {
  var verbose = u.log['VERBOSE'];
  if (['warn', 'info'].indexOf(verbose) < 0) { return; }

  var logger = u.log['LOGGER'] || console;
  logger.warn.apply(logger, arguments);
};

/**
 * @param {...} args
 */
u.log.error = function(args) {
  var verbose = u.log['VERBOSE'];
  if (['error', 'warn', 'info'].indexOf(verbose) < 0) { return; }

  var logger = u.log['LOGGER'] || console;
  logger.error.apply(logger, arguments);
};

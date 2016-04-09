/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/11/2015
 * Time: 11:53 AM
 */

goog.require('u.Geolocation');

goog.exportSymbol('u.Geolocation', u.Geolocation);
goog.exportProperty(u.Geolocation.prototype, 'equals', u.Geolocation.prototype.equals);
goog.exportProperty(u.Geolocation.prototype, 'copy', u.Geolocation.prototype.copy);
goog.exportProperty(u.Geolocation.prototype, 'distanceTo', u.Geolocation.prototype.distanceTo);
goog.exportProperty(u.Geolocation.prototype, 'destinationPoint', u.Geolocation.prototype.destinationPoint);
goog.exportProperty(u.Geolocation.prototype, 'boundingBox', u.Geolocation.prototype.boundingBox);

goog.exportProperty(u.Geolocation.prototype, 'getEarthRadiusWGS84', u.Geolocation.getEarthRadiusWGS84);
goog.exportProperty(u.Geolocation.prototype, 'convert', u.Geolocation.convert);
goog.exportProperty(u.Geolocation.prototype, 'convertUnits', u.Geolocation.convertUnits);
goog.exportProperty(u.Geolocation.prototype, 'googleMapPixels2Distance', u.Geolocation.googleMapPixels2Distance);
goog.exportProperty(u.Geolocation.prototype, 'googleMapMetersPixels2Zoom', u.Geolocation.googleMapMetersPixels2Zoom);

goog.exportSymbol('u.Geolocation.M2KM', u.Geolocation.M2KM);
goog.exportSymbol('u.Geolocation.KM2M', u.Geolocation.KM2M);

goog.exportSymbol('u.Geolocation.M2MI', u.Geolocation.M2MI);
goog.exportSymbol('u.Geolocation.MI2M', u.Geolocation.MI2M);

goog.exportSymbol('u.Geolocation.M2FT', u.Geolocation.M2FT);
goog.exportSymbol('u.Geolocation.FT2M', u.Geolocation.FT2M);

goog.exportSymbol('u.Geolocation.KM2MI', u.Geolocation.KM2MI);
goog.exportSymbol('u.Geolocation.MI2KM', u.Geolocation.MI2KM);

goog.exportSymbol('u.Geolocation.KM2FT', u.Geolocation.KM2FT);
goog.exportSymbol('u.Geolocation.FT2KM', u.Geolocation.FT2KM);

goog.exportSymbol('u.Geolocation.MI2FT', u.Geolocation.MI2FT);
goog.exportSymbol('u.Geolocation.FT2MI', u.Geolocation.FT2MI);

goog.exportSymbol('u.Geolocation.CONVERSION_TABLE', u.Geolocation.CONVERSION_TABLE);
goog.exportSymbol('u.Geolocation.CONVERSION_TABLE_S', u.Geolocation.CONVERSION_TABLE_S);
goog.exportSymbol('u.Geolocation.Unit', u.Geolocation.Unit);
goog.exportSymbol('u.Geolocation.UnitName', u.Geolocation.UnitName);
goog.exportSymbol('u.Geolocation.UnitLongNameSg', u.Geolocation.UnitLongNameSg);
goog.exportSymbol('u.Geolocation.UnitLongNamePl', u.Geolocation.UnitLongNamePl);

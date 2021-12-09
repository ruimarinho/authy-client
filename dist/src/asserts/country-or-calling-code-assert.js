'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = countryOrCallingCodeAssert;

var _googleLibphonenumber = require('google-libphonenumber');

var _validator = require('validator.js');

var _lodash = require('lodash');

var _debugnyan = require('debugnyan');

var _debugnyan2 = _interopRequireDefault(_debugnyan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Instances.
 */

/**
 * Module dependencies.
 */

const log = (0, _debugnyan2.default)('authy:country-or-calling-code-assert');
const phoneUtil = _googleLibphonenumber.PhoneNumberUtil.getInstance();
const numeric = /^\d+$/;

/**
 * Export `CountryOrCallingCodeAssert`.
 *
 * Validate a country calling code (e.g. '351', '1') based on a preset list of valid country calling codes.
 */

function countryOrCallingCodeAssert() {
  // Class name.
  this.__class__ = 'CountryOrCallingCode';

  // Validation algorithm.
  this.validate = value => {
    if (!(0, _lodash.isString)(value) && !(0, _lodash.isNumber)(value)) {
      throw new _validator.Violation(this, value, { value: 'must_be_a_string_or_number' });
    }

    if (!numeric.test(value)) {
      if (phoneUtil.getMetadataForRegion(value) === null) {
        log.debug({ countryCode: value }, `Unknown country code ${value}`);

        throw new _validator.Violation(this, value);
      }

      log.debug({ countryCode: value }, `Country code ${value} is valid`);
    } else if (_googleLibphonenumber.PhoneNumberUtil.UNKNOWN_REGION_ === phoneUtil.getRegionCodeForCountryCode(value)) {
      log.debug({ countryCallingCode: value }, `Unknown country calling code ${value}`);

      throw new _validator.Violation(this, value);
    }

    log.debug({ countryCallingCode: value }, `Country calling code ${value} is valid`);

    return true;
  };

  return this;
}
module.exports = exports.default;
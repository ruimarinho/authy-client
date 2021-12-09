'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = totpTokenAssert;

var _validator = require('validator.js');

var _lodash = require('lodash');

/**
 * Instances.
 */

/**
 * Module dependencies.
 */

const numeric = /^\d+$/;

/**
 * Export `TotpTokenAssert`.
 *
 * Validate a TOTP token based on http://tools.ietf.org/html/rfc6238.
 */

function totpTokenAssert() {
  // Class name.
  this.__class__ = 'TotpToken';

  // Token boundaries.
  this.boundaries = {
    max: 8,
    min: 6
  };

  // Validation algorithm.
  this.validate = value => {
    if (!(0, _lodash.isString)(value) && !(0, _lodash.isNumber)(value)) {
      throw new _validator.Violation(this, value, { value: 'must_be_a_string_or_number' });
    }

    if (!numeric.test(value)) {
      throw new _validator.Violation(this, value, { value: 'must_be_numeric' });
    }

    try {
      _validator.Assert.ofLength(this.boundaries).validate(value);
    } catch (e) {
      throw new _validator.Violation(this, value, e.violation);
    }

    return true;
  };

  return this;
}
module.exports = exports.default;
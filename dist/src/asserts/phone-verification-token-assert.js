'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = phoneVerificationTokenAssert;

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
 * Export `PhoneVerificationTokenAssert`.
 *
 * Validate an phone verification token.
 */

function phoneVerificationTokenAssert() {
  // Class name.
  this.__class__ = 'PhoneVerificationToken';

  // Token boundaries.
  this.boundaries = {
    max: 8,
    min: 4
  };

  // Validation algorithm.
  this.validate = value => {
    if (!(0, _lodash.isString)(value)) {
      throw new _validator.Violation(this, value, { value: 'must_be_a_string' });
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
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = authyIdAssert;

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
 * Export `AuthyIdAssert`.
 */

function authyIdAssert() {
  // Class name.
  this.__class__ = 'AuthyId';

  // Validation algorithm.
  this.validate = value => {
    if (!(0, _lodash.isString)(value) && !(0, _lodash.isNumber)(value)) {
      throw new _validator.Violation(this, value, { value: 'must_be_a_string_or_number' });
    }

    if (!numeric.test(value)) {
      throw new _validator.Violation(this, value, { value: 'must_be_numeric' });
    }

    return true;
  };

  return this;
}
module.exports = exports.default;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = logoAssert;

var _validator = require('validator.js-asserts');

var asserts = _interopRequireWildcard(_validator);

var _validator2 = require('validator.js');

var _lodash = require('lodash');

var _enums = require('../enums');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Inject `Uri` and `EqualKeys` extra asserts.
 */

/**
 * Module dependencies.
 */

const is = _validator2.Assert.extend((0, _lodash.pick)(asserts, ['Uri', 'EqualKeys']));

/**
 * Resolution choices.
 */

const choices = (0, _lodash.values)(_enums.resolution);

/**
 * Export `LogoAssert`.
 */

function logoAssert() {
  // Class name.
  this.__class__ = 'Logo';

  // Validation algorithm.
  this.validate = value => {
    try {
      is.equalKeys(['res', 'url']).validate(value);
      is.choice(choices).validate(value.res);
      is.uri().validate(value.url);
    } catch (e) {
      throw new _validator2.Violation(e.assert, value, e.violation);
    }

    return true;
  };

  return this;
}
module.exports = exports.default;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = uuid;

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Export uuid v4 generator.
 */

function uuid(a) {
  return a ? (a ^ _crypto2.default.randomBytes(1)[0] % 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);
}
/**
 * Module dependencies.
 */

module.exports = exports.default;
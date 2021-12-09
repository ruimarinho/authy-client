'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _standardHttpError = require('standard-http-error');

var _standardHttpError2 = _interopRequireDefault(_standardHttpError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Export `StandardError`.
 */

class StandardError extends _standardHttpError2.default {}
exports.default = StandardError;
/**
 * Module dependencies.
 */

module.exports = exports.default;
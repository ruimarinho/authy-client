'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _standardError = require('./standard-error');

var _standardError2 = _interopRequireDefault(_standardError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
/**
 * Module dependencies.
 */

/**
 * Export `HttpError`.
 */

class HttpError extends _standardError2.default {
  constructor(_ref) {
    let code = _ref.code,
        rest = _objectWithoutProperties(_ref, ['code']);

    super(code, (0, _lodash.get)(rest, 'message', (0, _lodash.get)(rest, 'properties.body.message')), rest.properties);
  }
}
exports.default = HttpError;
module.exports = exports.default;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _httpError = require('./http-error');

var _httpError2 = _interopRequireDefault(_httpError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
/**
 * Module dependencies.
 */

/**
 * `ValidationFailedError`.
 */

class ValidationFailedError extends _httpError2.default {
  constructor(_ref) {
    let rest = _objectWithoutProperties(_ref, []);

    super(_extends({ code: 400, message: 'Validation Failed' }, rest));
  }
}
exports.default = ValidationFailedError;
module.exports = exports.default;
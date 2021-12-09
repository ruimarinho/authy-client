'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
/**
 * Module dependencies.
 */

exports.default = parse;

var _lodash = require('lodash');

var _httpError = require('../errors/http-error');

var _httpError2 = _interopRequireDefault(_httpError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Export `parse` function to parse a response from Authy API.
 */

function parse(_ref) {
  var _ref2 = _slicedToArray(_ref, 2);

  let response = _ref2[0],
      body = _ref2[1];
  const statusCode = response.statusCode;


  if (statusCode !== 200) {
    throw new _httpError2.default({ code: statusCode, properties: { body: body } });
  }

  if (!body || !body.success || !(0, _lodash.has)(body, 'success')) {
    throw new _httpError2.default({ code: 500, properties: { body: body } });
  }

  return body;
}
module.exports = exports.default;
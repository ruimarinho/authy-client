'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _requestObfuscator = require('./request-obfuscator');

var _debugnyan = require('debugnyan');

var _debugnyan2 = _interopRequireDefault(_debugnyan);

var _requestLogger = require('@uphold/request-logger');

var _requestLogger2 = _interopRequireDefault(_requestLogger);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Instances.
 */

/**
 * Module dependencies.
 */

const log = (0, _debugnyan2.default)('authy:request');

/**
 * Export `request`.
 */

exports.default = (0, _requestLogger2.default)(_request2.default, request => {
  (0, _requestObfuscator.obfuscate)(request);

  if (request.type === 'response') {
    log.debug({ request: request }, `Received response for request ${request.id}`);

    return;
  }

  log.debug({ request: request }, `Making request ${request.id} to ${request.method} ${request.uri}`);
});
module.exports = exports.default;
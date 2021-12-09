'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('../../../../');

var _handler = require('../../../handler');

var _handler2 = _interopRequireDefault(_handler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
/**
 * Module dependencies.
 */

/**
 * Export command definition.
 */

exports.default = {
  builder: yargs => {
    yargs.option('action', {
      describe: 'The action or context of the request',
      type: 'string'
    }).option('action-message', {
      describe: 'A message for the specific action, if one is set',
      type: 'string'
    }).option('force', {
      describe: 'Whether to send an sms even if the user is using the mobile application',
      type: 'boolean'
    });
  },
  command: 'sms <authy-id>',
  describe: `Request token via sms. If the Authy app is in use by the user, this request is ignored and a push notification is sent instead, unless --force is specified`,
  handler: (0, _handler2.default)((() => {
    var _ref = _asyncToGenerator(function* (argv) {
      const client = new _.Client({ key: argv.key });

      return yield client.requestSms({ authyId: argv.authyId }, { action: argv.action, force: argv.force, message: argv.actionMessage });
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })())
};
module.exports = exports.default;
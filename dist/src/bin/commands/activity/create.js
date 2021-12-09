'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('../../../');

var _lodash = require('lodash');

var _handler = require('../../handler');

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
    yargs.option('data', { describe: 'A dictionary of data associated with the activity' }).coerce('data', data => {
      if (!(0, _lodash.isPlainObject)(data)) {
        throw new Error('Hidden details should be called with --data.<key>=<value>\n\nExample: --data.foo=bar --data.biz=net');
      }

      return data;
    }).option('ip', {
      describe: 'The ip address of the user registering the activity',
      type: 'string'
    }).option('type', {
      choices: Object.values(_.enums.activity),
      describe: 'The activity type',
      required: true
    });
  },
  command: 'create <authy-id>',
  describe: 'Create activity',
  handler: (0, _handler2.default)((() => {
    var _ref = _asyncToGenerator(function* (argv) {
      const client = new _.Client({ key: argv.key });

      return yield client.registerActivity({
        authyId: argv.authyId,
        data: argv.data,
        type: argv.type
      }, {
        ip: argv.ip
      });
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })())
};
module.exports = exports.default;
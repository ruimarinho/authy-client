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
    yargs.option('logos', { describe: 'The custom logos collection' }).coerce('logos', logos => {
      if (!(0, _lodash.isPlainObject)(logos)) {
        throw new Error('Logos should be called with --logos.<index>.res=<resolution> --logos.<index>.url=<url>\n\nExample: --logos.0.res=high --logos.0.url=https://foobar.com');
      }

      return Object.values(logos);
    }).option('hidden', { describe: 'A dictionary of hidden details associated with the approval request' }).coerce('hidden', logos => {
      if (!(0, _lodash.isPlainObject)(logos)) {
        throw new Error('Hidden details should be called with --hidden.<key>=<value>\n\nExample: --hidden.foo=bar --hidden.biz=net');
      }

      return logos;
    }).option('visible', { describe: 'A dictionary of visible details associated with the approval request' }).coerce('visible', logos => {
      if (!(0, _lodash.isPlainObject)(logos)) {
        throw new Error('Visible details should be called with --visible.<key>=<value>\n\nExample: --visible.foo=bar --visible.biz=net');
      }

      return logos;
    }).option('ttl', {
      describe: `The number of seconds that the approval request will be available for being responded. If set to 0, the approval request won't expire`,
      type: 'number'
    });
  },
  command: 'create <authy-id> <message>',
  describe: 'Create approval request',
  handler: (0, _handler2.default)((() => {
    var _ref = _asyncToGenerator(function* (argv) {
      const client = new _.Client({ key: argv.key });

      return yield client.createApprovalRequest({
        authyId: argv.authyId,
        details: {
          hidden: argv.hidden,
          visible: argv.visible
        },
        logos: argv.logos,
        message: argv.message
      }, {
        ttl: argv.ttl
      });
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })())
};
module.exports = exports.default;
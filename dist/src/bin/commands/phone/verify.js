'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('../../../');

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
    yargs.option('locale', {
      choices: Object.values(_.enums.locale),
      default: _.enums.locale.ENGLISH,
      describe: 'Locale'
    }).coerce('phone', phone => String(phone)).option('token', {
      describe: 'Token',
      type: 'string'
    }).option('via', {
      choices: [_.enums.verificationVia.CALL, _.enums.verificationVia.SMS],
      default: _.enums.verificationVia.SMS,
      describe: 'Via'
    });
  },
  command: 'verify <phone> <country-code>',
  describe: 'Verify phone using token',
  handler: (0, _handler2.default)((() => {
    var _ref = _asyncToGenerator(function* (argv) {
      const client = new _.Client({ key: argv.key });

      if (argv.token) {
        return yield client.verifyPhone({
          countryCode: argv.countryCode,
          phone: argv.phone,
          token: argv.token
        });
      }

      return yield client.startPhoneVerification({
        countryCode: argv.countryCode,
        phone: argv.phone,
        via: argv.via
      }, {
        locale: argv.locale
      });
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })())
};
module.exports = exports.default;
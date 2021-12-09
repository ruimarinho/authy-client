'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _prettyjson = require('prettyjson');

var _prettyjson2 = _interopRequireDefault(_prettyjson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* eslint-disable no-console */

/**
 * Export wrapping function.
 */

exports.default = fn => {
  return argv => {
    _asyncToGenerator(function* () {
      let result;

      try {
        result = yield fn(argv);
      } catch (e) {
        result = JSON.parse(JSON.stringify(e));
      }

      if (argv.pretty) {
        return console.log(_prettyjson2.default.render(result));
      }

      return console.log(require('util').inspect(result, false, 10));
    })();
  };
};

module.exports = exports.default;
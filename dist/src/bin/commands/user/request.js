'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Export command definition.
 */

exports.default = {
  builder: yargs => yargs.commandDir('request'),
  command: 'request <command>',
  describe: 'Request user token'
};
module.exports = exports.default;
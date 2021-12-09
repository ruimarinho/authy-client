'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Export command definition.
 */

exports.default = {
  builder: yargs => yargs.commandDir('get'),
  command: 'get <command>',
  describe: 'View user information'
};
module.exports = exports.default;
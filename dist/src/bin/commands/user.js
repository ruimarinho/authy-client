'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Export command definition.
 */

exports.default = {
  builder: yargs => yargs.commandDir('user'),
  command: 'user <command>',
  describe: 'Manage users'
};
module.exports = exports.default;
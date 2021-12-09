'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Export command definition.
 */

exports.default = {
  builder: yargs => yargs.commandDir('commands'),
  command: 'get <command>',
  describe: 'View phone information'
};
module.exports = exports.default;
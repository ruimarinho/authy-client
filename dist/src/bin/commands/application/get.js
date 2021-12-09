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
  describe: 'View application information'
};
module.exports = exports.default;
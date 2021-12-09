'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Export command definition.
 */

exports.default = {
  builder: yargs => yargs.commandDir('application'),
  command: 'application <command>',
  describe: 'Manage application information'
};
module.exports = exports.default;
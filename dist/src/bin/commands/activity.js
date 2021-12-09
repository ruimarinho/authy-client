'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Export command definition.
 */

exports.default = {
  builder: yargs => yargs.commandDir('activity'),
  command: 'activity <command>',
  describe: 'Manage activity'
};
module.exports = exports.default;
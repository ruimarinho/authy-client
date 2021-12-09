'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Export command definition.
 */

exports.default = {
  builder: yargs => yargs.commandDir('phone'),
  command: 'phone <command>',
  describe: 'Manage phone verifications'
};
module.exports = exports.default;
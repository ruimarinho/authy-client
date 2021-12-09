'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Export command definition.
 */

exports.default = {
  builder: yargs => yargs.commandDir('onetouch'),
  command: 'onetouch <command>',
  describe: 'Manage onetouch requests'
};
module.exports = exports.default;
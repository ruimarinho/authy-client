
/**
 * Module dependencies.
 */

import { Client } from '../../../../';
import handle from '../../../handler';

/**
 * Export command definition.
 */

export default {
  command: 'status <id>',
  describe: 'Get approval request <id> status',
  handler: handle(async argv => {
    const client = new Client({ key: argv.key });

    return await client.getApprovalRequest({ id: argv.id });
  })
};

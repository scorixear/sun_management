import Discord from 'discord.js';

import permHandler from '../lib/permissionHandler';

export default class Command {
  // What is 'category'
  constructor(category) {
    if (new.target == Command) {
      throw new TypeError('Cannot construct Abstract instances directly');
    }
    this.category = category;
    this.permissions = [];
    this.command = '';
    this.usage = '';
    this.description = () => '';
    this.example = '';
  }

  /**
   * Executes the command
   * @param {Array<String>} args the arguments fo the msg
   * @param {Discord.Message} msg the msg object
   * @param {{}} params added parameters and their argument
   */
  executeCommand(args, msg, params = {}) {
    const hasPermission = permHandler.checkPermissions(
      this.permissions,
      msg,
      this.command
    );
    if (hasPermission === false) {
      throw new Error('Invalid');
    }
  }
}

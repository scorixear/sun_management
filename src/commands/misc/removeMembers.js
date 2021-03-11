import { Message } from 'discord.js';

import Command from '../command';
import messageHandler from '../../lib/messageHandler';
import { dic as language } from '../../lib/languageHandler';
// import config from '../config.js'
// import sqlHandler from '../lib/sqlHandler.js'
import albionApiHandler from '../../lib/albionApiHandler';

export default class RemoveMembers extends Command {
  constructor(category) {
    super(category);

    const desc = `${language.lang.commands.removeMembers.description}`;

    this.command = 'removeMembers';
    this.description = () => desc;
    this.example = 'removeMembers';
    this.permissions = ['MANAGE_ROLES'];
    this.usage = `removeMembers`;
  }
  /**
   * Executes the command
   * @param {Array<String>} args the arguments fo the msg
   * @param {Message} msg the msg object
   * @param {*} params added parameters and their argument
   */
  async executeCommand(args, msg, params) {
    // check permissions
    try {
      super.executeCommand(args, msg, params);
    } catch (err) {
      return;
    }
    // starts removing players
    messageHandler.sendRichTextDefault({
      msg: msg,
      title: language.lang.commands.removeMembers.labels.titleRemoving,
      description:
        language.lang.commands.removeMembers.labels.descriptionRemoving,
      categories: undefined,
      thumbnail: undefined,
      footer: undefined,
      color: undefined,
      url: undefined,
      image: undefined
    });

    await albionApiHandler.removeMemberRoles();
  }
}

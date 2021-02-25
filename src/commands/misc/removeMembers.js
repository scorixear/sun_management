import Command from '../command.js';
import messageHandler from '../../misc/messageHandler.js';
import {dic as language, replaceArgs} from '../../misc/languageHandler.js';
import config from '../../config.js';
import sqlHandler from '../../misc/sqlHandler.js';
import {GuildEmoji, Message} from 'discord.js';
import albionApiHandler from '../../misc/albionApiHandler.js';

export default class RemoveMembers extends Command {
  constructor(category) {
    super(category);
    this.usage = `removeMembers`;
    this.command = 'removeMembers';
    this.description = () => language.commands.removeMembers.description;
    this.example = 'removeMembers';
    this.permissions = ["MANAGE_ROLES"]
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
      title: language.commands.removeMembers.labels.titleRemoving,
      description: language.commands.removeMembers.labels.descriptionRemoving,
    });
    const removedPlayers = await albionApiHandler.clearAlbionMembers();
    

  }
}
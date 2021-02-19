import Command from './../command.js';
import messageHandler from '../../misc/messageHandler.js';
import {dic as language, replaceArgs} from '../../misc/languageHandler.js';
import config from '../../config.js';
import sqlHandler from '../../misc/sqlHandler.js';
import {Message} from 'discord.js';

export default class Register extends Command {
  constructor(category) {
    super(category);
    this.usage = `register <Name>`;
    this.command = 'register';
    this.description = () => language.commands.register.description;
    this.example = 'register Scorix';
  }
  /**
   * Executes the command
   * @param {Array<String>} args the arguments fo the msg
   * @param {Message} msg the msg object
   * @param {*} params added parameters and their argument
   */
  async executeCommand(args, msg, params) {
    try {
      super.executeCommand(args, msg, params);
    } catch (err) {
      return;
    }
    
    if(args.length == 0) {
      return;
    }

    if(msg.channel.name != config.registerChannel) {
      return;
    }

    // register player
    if(!sqlHandler.findPlayer(msg.author.id)) {
      sqlHandler.savePlayer(msg.author.id, args[0]);
      
      //send register message
      messageHandler.sendRichTextDefault({
        guild: msg.guild,
        channel: msg.channel,
        title: language.commands.register.labels.title,
        description: replaceArgs(language.commands.register.description, [args[0]])
      });
    }

  }
}
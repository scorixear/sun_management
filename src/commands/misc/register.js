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

    if(args[0] === config.ignoreRole) {
      return;
    }

    let returnValue = true;
    // register player
    if(!await sqlHandler.findPlayer(msg.author.id)) {
      returnValue = await sqlHandler.savePlayer(msg.author.id, args[0]);
    } else {
      returnValue = await sqlHandler.editPlayer(msg.author.id, args[0]);
    }
    if(returnValue) {
      messageHandler.sendRichTextDefault({
        msg: msg,
        title: replaceArgs(language.commands.register.labels.title, [msg.guild.member(msg.author).displayName]),
        description: replaceArgs(language.commands.register.labels.description, [msg.guild.member(msg.author), args[0]])
      });
    } else {
      messageHandler.sendRichTextDefault({
        msg: msg,
        title: language.commands.register.error.title,
        description: replaceArgs(language.commands.register.error.description, [args[0]]),
        color: 0xcc0000,
      });
    }
   

  }
}
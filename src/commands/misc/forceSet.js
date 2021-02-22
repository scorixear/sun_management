import Command from './../command.js';
import messageHandler from '../../misc/messageHandler.js';
import {dic as language, replaceArgs} from '../../misc/languageHandler.js';
import config from '../../config.js';
import sqlHandler from '../../misc/sqlHandler.js';
import {Message} from 'discord.js';
import discordHandler from '../../misc/discordHandler.js';

export default class ForceSet extends Command {
  constructor(category) {
    super(category);
    this.usage = `forceSet <Name>`;
    this.command = 'forceSet';
    this.description = () => language.commands.forceSet.description;
    this.example = 'forceSet @Frank Sinatra franksinatra';
    this.permissions = ['MANAGE_CHANNELS']
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
    if(args.length == 1) {
      let user = this.getUserFromMention(args[0]);
      if(!user) {
        return;
      }
      await sqlHandler.removePlayer(user.id);
      messageHandler.sendRichTextDefault({
        msg: msg,
        title: replaceArgs(language.commands.forceSet.labels.removeTitle, [msg.guild.member(user).displayName]),
        description: replaceArgs(language.commands.forceSet.labels.removeDescription, [msg.guild.member(user), args[1]])
      });
    }
    
    if(args.length < 2) {
      return;
    }

    if(msg.channel.name != config.registerChannel) {
      return;
    }

    let returnValue = true;
    let user = this.getUserFromMention(args[0]);
    if(!user) {
      return;
    }

    // register player
    if(!await sqlHandler.findPlayer(user.id)) {
      returnValue = await sqlHandler.savePlayer(user.id, args[1]);
    } else {
      returnValue = await sqlHandler.editPlayer(user.id, args[1]);
    }
    if(returnValue) {
      messageHandler.sendRichTextDefault({
        msg: msg,
        title: replaceArgs(language.commands.forceSet.labels.title, [msg.guild.member(user).displayName]),
        description: replaceArgs(language.commands.forceSet.labels.description, [msg.guild.member(user), args[1]])
      });
    }
   

  }

  getUserFromMention(mention) {
    if (!mention) return;
  
    if (mention.startsWith('<@') && mention.endsWith('>')) {
      mention = mention.slice(2, -1);
  
      if (mention.startsWith('!')) {
        mention = mention.slice(1);
      }
  
      return discordHandler.client.users.cache.get(mention);
    }
  }

  
}
import Command from '../command.js';
import messageHandler from '../../misc/messageHandler.js';
import {dic as language, replaceArgs} from '../../misc/languageHandler.js';
import config from '../../config.js';
import sqlHandler from '../../misc/sqlHandler.js';
import {Message} from 'discord.js';
import discordHandler from '../../misc/discordHandler.js';

export default class Register extends Command {
  constructor(category) {
    super(category);
    this.usage = `register <User> <Name>`;
    this.command = 'register';
    this.description = () => language.commands.register.description;
    this.example = 'register @Frank Sinatra franksinatra';
    this.permissions = ['MANAGE_ROLES']
  }
  /**
   * Executes the command
   * @param {Array<String>} args the arguments fo the msg
   * @param {Message} msg the msg object
   * @param {*} params added parameters and their argument
   */
  async executeCommand(args, msg, params) {
    // checks permissions
    try {
      super.executeCommand(args, msg, params);
    } catch (err) {
      return;
    }

    // if there is only the player name given
    if(args.length == 1) {
      // retrieve user object from mention
      let user = this.getUserFromMention(args[0]);
      if(!user) {
        return;
      }
      // removes ingame entry
      await sqlHandler.removePlayer(user.id);
      messageHandler.sendRichTextDefault({
        msg: msg,
        title: replaceArgs(language.commands.register.labels.removeTitle, [msg.guild.member(user).displayName]),
        description: replaceArgs(language.commands.register.labels.removeDescription, [msg.guild.member(user), args[1]])
      });
      return;
    }
    
    // if args are less then two this execution ends here
    if(args.length < 2) {
      return;
    }

    // if channel name is not the register channel
    if(msg.channel.name != config.registerChannel) {
      return;
    }

    // retrieve User object from mention
    let returnValue = true;
    let user = this.getUserFromMention(args[0]);
    if(!user) {
      return;
    }
    // if given role is not the ignore role
    if(args[1] !== config.ignoreRole) {
      // check if there is already a player registered with this ingame name
      const previousOwner = await sqlHandler.findPlayerFromIngameName(args[1]);
      // if yes remove the previous entry
      if(previousOwner) {
        await sqlHandler.removePlayer(previousOwner);
      }
    }
    

    // if player is not already entered
    if(!await sqlHandler.findPlayer(user.id)) {
      // save entry
      returnValue = await sqlHandler.savePlayer(user.id, args[1]);
    } else {
      // edit entry
      returnValue = await sqlHandler.editPlayer(user.id, args[1]);
    }
    // if save was successfull
    if(returnValue) {
      messageHandler.sendRichTextDefault({
        msg: msg,
        title: replaceArgs(language.commands.register.labels.title, [msg.guild.member(user).displayName]),
        description: replaceArgs(language.commands.register.labels.description, [msg.guild.member(user), args[1]])
      });
    }
   

  }

  /**
   * Retrieves user from mention
   * @param {string} mention 
   */
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
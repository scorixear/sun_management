import Discord from 'discord.js';

import Command from '../command';
import messageHandler from '../../lib/messageHandler';
import { dic as language, replaceArgs } from '../../lib/languageHandler';
import config from '../../config';
import sqlHandler from '../../lib/sqlHandler';
import discordHandler from '../../lib/discordHandler';

export default class Register extends Command {
  constructor(category) {
    super(category);
    this.usage = `register <User> <Name>`;
    this.command = 'register';
    this.description = () => language.lang.commands.register.description;
    this.example = 'register @Frank Sinatra franksinatra';
    this.permissions = ['MANAGE_ROLES'];
  }
  /**
   * Executes the command
   * @param {Array<String>} args the arguments fo the msg
   * @param {Discord.Message} msg the msg object
   * @param {*} params added parameters and their argument
   */
  async executeCommand(args, msg, params) {
    // checks permissions
    try {
      super.executeCommand(args, msg, params);
      console.log(`Executing command`);
    } catch (err) {
      console.error(err);
      return;
    }

    // if there is only the player name given
    if (args.length == 1) {
      // retrieve user object from mention
      let user = this.getUserFromMention(args[0]);
      if (!user) {
        console.log('No user found, returning');
        return;
      }

      console.log(`Retrieved user from mention`);

      // removes in-game entry
      await sqlHandler.removePlayer(user.id);
      messageHandler.sendRichTextDefault({
        msg,
        title: replaceArgs(language.lang.commands.register.labels.removeTitle, [
          msg.guild.member(user).displayName
        ]),
        description: replaceArgs(
          language.lang.commands.register.labels.removeDescription,
          // What are we getting here? I chose the username
          [msg.guild.member(user).user.username, args[1]]
        ),
        categories: undefined,
        color: undefined,
        image: undefined,
        thumbnail: undefined,
        url: undefined,
        footer: undefined
      });
      return;
    }

    // if args are less then two this execution ends here
    if (args.length < 2) {
      console.log('Args.length < 2');
      return;
    }

    // if channel name is not the register channel
    // @ts-ignore
    if (msg.channel.name != config.registerChannel) {
      /* There is no such thing as `msg.channel.name` (in the types... this is discords mistake)
       I suggest using IDs as those are available, and don't change on channel name changes. < This is still true, though.
       */
      console.error(
        // @ts-ignore
        `Wrong channel, my friend. I need ${config.registerChannel} but you gave me ${msg.channel.name}`
      );

      return;
    }

    // retrieve User object from mention
    let returnValue = true;
    let user = this.getUserFromMention(args[0]);

    if (!user) {
      console.log(`Could not find a matching user, returning`);
      return;
    }

    // if given role is not the ignore role
    if (args[1] !== config.ignoreRole) {
      // check if there is already a player registered with this in-game name
      const previousOwner = await sqlHandler.findPlayerFromInGameName(args[1]);

      console.log(`No ignore role`);
      // if yes remove the previous entry
      if (previousOwner) {
        await sqlHandler.removePlayer(previousOwner);
      }
    }

    // if player is not already entered
    if (!(await sqlHandler.findPlayer(user.id))) {
      console.log(`Saving player ${user.id} as in-game ${args[1]}`);
      // save entry
      returnValue = await sqlHandler.savePlayer(user.id, args[1]);
    } else {
      console.log(`Editing player ${user.id}`);
      // edit entry
      returnValue = await sqlHandler.editPlayer(user.id, args[1]);
    }

    // if save was successful
    if (returnValue) {
      messageHandler.sendRichTextDefault({
        msg: msg,
        title: replaceArgs(language.lang.commands.register.labels.title, [
          msg.guild.member(user).displayName
        ]),
        description: replaceArgs(
          language.lang.commands.register.labels.description,
          [msg.guild.member(user).user.username, args[1]]
        ),
        color: undefined,
        categories: undefined,
        thumbnail: undefined,
        image: undefined,
        url: undefined,
        footer: undefined
      });
    }
  }

  /**
   * Retrieves user from mention
   * @param {String} mention
   */
  getUserFromMention(mention) {
    if (!mention) {
      console.log('No mention, returning');
    }

    console.log(`this is mention ${mention}`);

    if (mention.startsWith('<@') && mention.endsWith('>')) {
      mention = mention.slice(2, -1);

      if (mention.startsWith('!')) {
        mention = mention.slice(1);
      }

      // @ts-ignore
      // I'm unsure how this works, but I guess it does. (.get is not a function on Collection, I think types are messed up in this case)
      return discordHandler.client.users.cache.get(mention);
    }
  }
}

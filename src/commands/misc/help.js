import Discord from 'discord.js';

import cmdHandler from '../../lib/commandHandler';
import msgHandler from '../../lib/messageHandler';
import permHandler from '../../lib/permissionHandler';
import config from '../../config';
import Command from '../command';
import { dic as language, replaceArgs } from '../../lib/languageHandler';

export default class Help extends Command {
  constructor(category) {
    super(category);
    this.usage = `help [${language.lang.commands.help.labels.command.toLowerCase()}]`;
    this.command = 'help';
    this.description = () => language.lang.commands.help.description;
    this.example = 'help\nhelp config';
  }
  /**
   * Executes the command
   * @param {Array<String>} args the arguments fo the msg
   * @param {Discord.Message} msg the msg object
   * @param {*} params added parameters and their argument
   */
  executeCommand(args, msg, params) {
    try {
      super.executeCommand(args, msg, params);
    } catch (err) {
      return;
    }
    // if help command is about another command
    if (args && args.length > 0) {
      // find specified command
      const command = cmdHandler.commands.find((v) => v.command == args[0]);
      if (command) {
        // if player has not the permission
        // print fake message that the command does not exist
        if (
          permHandler.checkPermissionSilent(command.permissions, msg) === false
        ) {
          msgHandler.sendRichText({
            msg,
            title: 'Help Info',
            description: undefined,
            categories: [
              {
                title: 'Info',
                text: replaceArgs(language.lang.commands.help.error.unknown, [
                  config.botPrefix
                ])
              }
            ],
            color: undefined,
            image: undefined,
            thumbnail: undefined,
            url: undefined,
            footer: undefined
          });
          return;
        }

        // parse command variables
        const example =
          '```' +
          config.botPrefix +
          command.example
            .split('\n')
            .reduce((acc, val) => acc + '```\n```' + config.botPrefix + val) +
          '```';
        msgHandler.sendRichTextDefault({
          msg: msg,
          title: undefined,
          description: undefined,
          categories: [
            {
              title: language.lang.commands.help.labels.command,
              text: `\`${config.botPrefix}${command.command}\``,
              inline: true
            },
            {
              title: language.lang.general.description,
              text: command.description(),
              inline: true
            },
            {
              title: language.lang.general.usage,
              text: `\`\`\`${config.botPrefix}${command.usage}\`\`\``
            },
            {
              title: language.lang.general.example,
              text: example
            }
          ],
          color: undefined,
          image: undefined,
          thumbnail: undefined,
          url: undefined,
          footer: undefined
        });
      } else {
        // Send 'unknown command' message
        msgHandler.sendRichText({
          msg,
          title: 'Help Info',
          description: undefined,
          categories: [
            {
              title: 'Info',
              text: replaceArgs(language.lang.commands.help.error.unknown, [
                config.botPrefix
              ])
            }
          ],
          color: undefined,
          image: undefined,
          thumbnail: undefined,
          url: undefined,
          footer: undefined
        });
      }
      return;
    }

    // Gather all commands that this person has permissions for
    // Order commands by their folder structure
    const categories = new Map();

    cmdHandler.commands.forEach((cmd) => {
      if (permHandler.checkPermissionSilent(cmd.permissions, msg)) {
        if (categories.has(cmd.category)) {
          categories.get(cmd.category).push(cmd.command);
        } else {
          categories.set(cmd.category, new Array(cmd.command));
        }
      }
    });

    // create embedded categories for embedded message
    const embeddedCategories = new Array({
      title: 'Info',
      text: replaceArgs(language.lang.commands.help.success.type, [
        config.botPrefix,
        language.lang.commands.help.labels.command
      ])
    });

    categories.forEach((val, title) => {
      const reducedVal = val.reduce(
        (acc, val) => `${acc}\n${config.botPrefix}${val}`
      );

      const text = `\`${config.botPrefix}${reducedVal}\``;

      //  const commands =
      //    '`' +
      //    config.botPrefix +
      //    val.reduce((acc, val) => acc + '`\n`' + config.botPrefix + val) +
      //    '`';

      embeddedCategories.push({ title, text });
    });
    // send message
    msgHandler.sendRichText({
      msg,
      title: 'Help Info',
      description: undefined,
      categories: embeddedCategories,
      color: 0x616161,
      image: undefined,
      thumbnail: undefined,
      url: undefined,
      footer: undefined
    });
  }
}

import cmdHandler from '../../lib/commandHandler.js'
import msgHandler from '../../lib/messageHandler.js'
import permHandler from '../../lib/permissionHandler.js'
import config from '../config.js'
import Command from '../main.js'
import { dic as language, replaceArgs } from '../../lib/languageHandler.js'

export default class Help extends Command {
  constructor(category) {
    super(category)
    this.usage = `help [${language.commands.help.labels.command.toLowerCase()}]`
    this.command = 'help'
    this.description = () => language.commands.help.description
    this.example = 'help\nhelp config'
  }
  /**
   * Executes the command
   * @param {Array<String>} args the arguments fo the msg
   * @param {Message} msg the msg object
   * @param {*} params added parameters and their argument
   */
  executeCommand(args, msg, params) {
    try {
      super.executeCommand(args, msg, params)
    } catch (err) {
      return
    }
    // if help command is about another command
    if (args && args.length > 0) {
      // find specified command
      const command = cmdHandler.commands.find((v) => v.command == args[0])
      if (command) {
        // if player has not the permission
        // print fake message that the command does not exist
        if (
          permHandler.checkPermissionSilent(command.permissions, msg) === false
        ) {
          msgHandler.sendRichText(msg, 'Help Info', [
            {
              title: 'Info',
              text: replaceArgs(language.commands.help.error.unknown, [
                config.botPrefix
              ])
            }
          ])
          return
        }
        // parse command variables
        const example =
          '```' +
          config.botPrefix +
          command.example
            .split('\n')
            .reduce((acc, val) => acc + '```\n```' + config.botPrefix + val) +
          '```'
        msgHandler.sendRichTextDefault({
          msg: msg,
          categories: [
            {
              title: language.commands.help.labels.command,
              text: `\`${config.botPrefix}${command.command}\``,
              inline: true
            },
            {
              title: language.general.description,
              text: command.description(),
              inline: true
            },
            {
              title: language.general.usage,
              text: `\`\`\`${config.botPrefix}${command.usage}\`\`\``
            },
            {
              title: language.general.example,
              text: example
            }
          ]
        })
      } else {
        // print unkown command message
        msgHandler.sendRichText(msg, 'Help Info', [
          {
            title: 'Info',
            text: replaceArgs(language.commands.help.error.unknown, [
              config.botPrefix
            ])
          }
        ])
      }
      return
    }

    // gather all commands that this persion has permissions to
    // and order them by their folder structure
    const categories = new Map()
    cmdHandler.commands.forEach((cmd) => {
      if (permHandler.checkPermissionSilent(cmd.permissions, msg)) {
        if (categories.has(cmd.category)) {
          categories.get(cmd.category).push(cmd.command)
        } else {
          categories.set(cmd.category, new Array(cmd.command))
        }
      }
    })
    // create embedded categories for embedded message
    const embededCategories = new Array({
      title: 'Info',
      text: replaceArgs(language.commands.help.success.type, [
        config.botPrefix,
        language.commands.help.labels.command
      ])
    })
    categories.forEach((value, key, map) => {
      const commands =
        '`' +
        config.botPrefix +
        value.reduce((acc, val) => acc + '`\n`' + config.botPrefix + val) +
        '`'
      embededCategories.push({
        title: key,
        text: commands,
        inline: true
      })
    })
    // send message
    msgHandler.sendRichText(msg, 'Help Info', embededCategories, 0x616161)
  }
}

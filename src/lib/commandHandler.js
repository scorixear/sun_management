import Fs from 'fs';
import { Message } from 'discord.js';

import config from '../config';
import msgHandler from './messageHandler';
import emojiHandler from './emojiHandler';
import levenshteinDistance from './LevenshteinDistance';
import { dic as language, replaceArgs } from './languageHandler';

const commandFiles = Fs.readdirSync('./src/commands');
const commands = [];

commandFiles.map((fileName) => {
  if (fileName !== 'command.js' && fileName.endsWith('.js')) {
    const command = require(`../commands/${fileName}`);
    console.debug(command);

    if (command.commands) {
      for (const cmd of command.commands) {
        commands.push(Reflect.construct(cmd, [fileName]));
      }
    } else {
      commands.push(Reflect.construct(command.default, [fileName]));
    }
  }
});

/**
 * Parses the Command
 * @param {Message} msg
 */
function parseCommand(msg) {
  let module;
  let command;
  let args;
  let params;
  // if does not start with prefix, return;
  if (msg.content[0] !== config.botPrefix) return;
  // else if (msg.channel.name !== config.botChannel) return;
  // else if (msg.guild.name !== config.botGuild) return;
  else {
    // parses Command Parameters
    const temp = parseCommandParams(msg);
    if (!temp) return;
    command = temp.command;
    args = temp.args;
    params = temp.params;
    // find class that represents the given command
    module = commands.find(
      (c) => c.command.toLowerCase() === command.toLowerCase()
    );
  }
  // if no command was found
  if (!module || !module.executeCommand) {
    const commandOptions = commands.map((c) => c.command);
    const message = replaceArgs(language.lang.handlers.command.error.unknown, [
      config.botPrefix
    ]);
    // calculate levenshteinDistance to the closest command
    const possible = levenshteinDistance.findClosestMatch(
      command.toLowerCase(),
      commandOptions
    );
    // resolve it with reactions
    emojiHandler.resolveWithReaction(
      msg,
      message,
      possible,
      msg.content.substring(command.length + 1),
      (c, m, a) => {
        module = commands.find(
          (x) => x.command.toLowerCase() == c.toLowerCase()
        );
        module.executeCommand(a[0], m, a[1]);
      },
      [args, params]
    );

    return;
  }
  // otherwise execute command
  try {
    module.executeCommand(args, msg, params);
  } catch (err) {
    // if any error occurred during executing print a message
    console.log(err);
    msgHandler.sendRichText({
      msg,
      title: language.lang.general.error,
      description: undefined,
      categories: [
        {
          title: language.general.message,
          text: replaceArgs(
            language.lang.handlers.command.error.generic_error,
            [config.botPrefix, command]
          )
        }
      ],
      color: undefined,
      image: undefined,
      thumbnail: undefined,
      url: undefined,
      footer: undefined
    });
  }
}

/**
 * Parses a string to arguments
 * @param {Message} msg
 * @param {string} msgArgs the string to parse
 * @return {Array<string>}
 */
function parseArgs(msg, msgArgs) {
  const argsRegex = /(?: +([^ "]+|"[^"]*"))/g;
  if (!argsRegex.test(msgArgs)) {
    msgHandler.sendRichText({
      msg,
      title: language.lang.general.error,
      description: undefined,
      categories: [
        {
          title: language.lang.general.message,
          text: language.lang.handlers.command.error.args_format
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

  argsRegex.lastIndex = 0;
  const argsArray = [];
  let temp;

  while ((temp = argsRegex.exec(msgArgs))) {
    if (temp[1].startsWith('"') && temp[1].endsWith('"')) {
      argsArray.push(temp[1].substring(1, temp[1].length - 1));
    } else {
      argsArray.push(temp[1]);
    }
  }

  return argsArray;
}

/**
 * Parses a string for parameters
 * @param {Message} msg
 * @param {string} msgParams the string to parse for params
 * @return {{}}
 */
function parseParams(msg, msgParams) {
  const paramsRegex = / +(--[^ ]+)(?: +([^ "-]+|"[^"]*"))?/g;
  if (!paramsRegex.test(msgParams)) {
    msgHandler.sendRichText({
      msg,
      title: language.lang.general.error,
      description: undefined,
      categories: [
        {
          title: language.lang.general.message,
          text: language.lang.handlers.command.error.params_format
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
  paramsRegex.lastIndex = 0;
  const rawParams = [];
  let temp;
  while ((temp = paramsRegex.exec(msgParams))) {
    rawParams.push(temp[1]);
    if (temp[2]) {
      rawParams.push(temp[2]);
    }
  }
  let lastOption;
  const params = {};
  for (let i = 0; i < rawParams.length; i++) {
    let current = rawParams[i];
    if (current.startsWith('--')) {
      lastOption = current.substring(2);
      params[lastOption] = '';
    } else {
      if (current.startsWith('"') && current.endsWith('"')) {
        current = current.substring(1, current.length - 1);
      }
      params[lastOption] = current;
    }
  }
  return params;
}

/**
 * Parses a string into args and params without expecting a command
 * @param {Message} msg the message object to send
 * @param {Array<string>} attributes the attributes string to parse
 * @param {string} generalError the general error to print
 * @return {{args: Array<string>, params: {}}}
 */
function parseWithoutCommand(msg, attributes, generalError) {
  const regex = /^((?:(?!--).)+)?( +--.+)?$/;

  if (attributes.map((att) => !regex.test(att))) {
    msgHandler.sendRichText({
      msg,
      title: language.lang.general.error,
      description: undefined,
      categories: [
        {
          title: language.lang.general.message,
          text: generalError
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

  const regexSplit = regex.exec(attributes);
  let args = regexSplit[1];
  let params = regexSplit[2];
  if (args) {
    args = parseArgs(msg, ' ' + args);
  } else {
    args = [];
  }
  if (params) {
    params = parseParams(msg, params);
  } else {
    params = {};
  }
  return { args, params };
}

/**
 * Parses a command from the given msg object
 * @param {Message} msg the message object to parse from
 * @return {{command: String, args: Array<String>, params: {}}} the parsed command
 */
function parseCommandParams(msg) {
  const regex = new RegExp(
    '^\\' + `${config.botPrefix}([^ ]+)((?:(?!--).)+)?( +--.+)?$`
  );
  if (!regex.test(msg.content)) {
    msgHandler.sendRichText({
      msg,
      title: language.lang.general.error,
      description: undefined,
      categories: [
        {
          title: language.lang.general.message,
          text: replaceArgs(
            language.lang.handlers.command.error.general_format,
            [config.botPrefix]
          )
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
  const regexSplit = regex.exec(msg.content);
  const command = regexSplit[1];
  let args = regexSplit[2];
  let params = regexSplit[3];
  if (args) {
    args = parseArgs(msg, args);
  } else {
    args = [];
  }
  if (params) {
    params = parseParams(msg, params);
  } else {
    params = {};
  }
  return { command, args, params };
}

export default {
  parseCommand,
  commands
};

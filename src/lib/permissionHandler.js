import Discord from 'discord.js';

import msgHandler from '../lib/messageHandler';
import config from '../config';
import { dic as language, replaceArgs } from '../lib/languageHandler';

/**
 * Checks if the user has permissions and prints a message if not
 * @param {Discord.PermissionResolvable} permissions
 * @param {Discord.Message} msg
 * @param {string} command
 * @return {boolean}
 */
function checkPermissions(permissions, msg, command) {
  const user = msg.member;
  if (user.hasPermission(permissions) == false) {
    msgHandler.sendRichText({
      msg,
      title: language.lang.general.error,
      categories: [
        {
          title: language.lang.general.message,
          text: replaceArgs(language.lang.handlers.permissions.error, [
            config.botPrefix,
            command
          ]),
          inline: undefined
        }
      ],
      color: undefined,
      image: undefined,
      description: undefined,
      thumbnail: undefined,
      url: undefined,
      footer: undefined
    });
    return false;
  }
  return true;
}

/**
 * Checks if the user has permissions
 * @param {Discord.PermissionResolvable} permissions
 * @param {Discord.Message} msg
 * @return {boolean}
 */
function checkPermissionSilent(permissions, msg) {
  const user = msg.member;
  return user.hasPermission(permissions);
}

export default { checkPermissions, checkPermissionSilent };

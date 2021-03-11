import request from 'request';

import config from '../config';
import discordHandler from './discordHandler';
import messageHandler from './messageHandler';
import { dic as language, replaceArgs } from './languageHandler';

const baseUri = 'https://gameinfo.albiononline.com/api/gameinfo/';
const searchQueryStr = 'search?q=';

const members = [];
const guildIds = [];

const allGuildsCache = discordHandler.client.guilds.cache;

/**
 * Removes the roles from the players
 */
async function removeRoles() {
  const playersToRemove = [];
  // console.log(allGuildsCache);
  for (const guild of allGuildsCache) {
    playersToRemove.push(
      await discordHandler.removeRolesFromPlayers(guild[1], members)
    );
  }

  return playersToRemove;
}

/**
 * Clears Roles from Members who're not in specified AO guilds
 */
async function removeMemberRoles() {
  // if guildIds are not cached, retrieve them
  if (guildIds.length < 1) {
    await searchGuildIds();
  }
  // for each guild id
  for (const guildId of guildIds) {
    console.log(`${baseUri}guilds/${guildId}/members`);
    try {
      // retrieve the members list
      const res = await doRequest(`${baseUri}guilds/${guildId}/members`);
      // console.debug(res);
      addGuildMembers(res);
    } catch {
      return;
    }
  }

  console.log(`Do we have member?\n${members}`);

  // Remove the roles
  const removedPlayers = await removeRoles();
  // Send message with removed players in each specified Discord guild
  for (const guild of allGuildsCache) {
    const channel = guild[1].channels.cache.find(
      (channel) => channel.name === config.removeChannel
    );

    const title = replaceArgs(
      language.lang.commands.removeMembers.labels.title,
      [removedPlayers.length.toString()]
    );

    const description = replaceArgs(
      language.lang.commands.removeMembers.labels.description,
      // Make new line for each plater
      [removedPlayers.join('\n')]
    );

    messageHandler.sendRichTextDefaultExplicit({
      guild,
      channel,
      title,
      description,
      author: undefined,
      categories: undefined,
      thumbnail: undefined,
      footer: undefined,
      color: undefined,
      url: undefined,
      image: undefined
    });
  }

  return removedPlayers;
}
/**
 * Adds a guild member name to the list
 * @param {any} arg
 */
function addGuildMembers(arg) {
  arg.forEach((playerInfo) => {
    // Debug:
    // console.debug(playerInfo);
    // Push name to members list
    members.push(playerInfo.Name);
  });
}

/**
 * Search Guild IDs
 */

async function searchGuildIds() {
  for (const guildName of config.trackedGuilds) {
    try {
      const body = await doRequest(`${baseUri}${searchQueryStr}${guildName}`);
      for (const guildInfo of body.guilds) {
        if (config.trackedGuilds.includes(guildInfo.Name)) {
          guildIds.push(guildInfo.Id);
        }
      }
    } catch {
      return;
    }
  }
}

/**
 * Converts the request into a promise to use awaits.
 * @param {String} url
 * @return {Promise<any>}
 */
function doRequest(url) {
  return new Promise(function (resolve, reject) {
    request({ uri: url, json: true }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        resolve(body);
      } else {
        console.log('Albion API Error: ', url, error, response.statusCode);
        reject(error);
      }
    });
  });
}

export default {
  removeMemberRoles
};

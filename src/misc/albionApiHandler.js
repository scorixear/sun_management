// import packages
import request from 'request';
import config from '../config';
import discordHandler from './discordHandler';
import messageHandler from './messageHandler';
import {dic as language, replaceArgs} from './languageHandler.js';
const baseUri = 'https://gameinfo.albiononline.com/api/gameinfo/';
const guildSearch = 'search?q=';
let guildIds = [];
let guildMembers = [];

/**
 * Clears Roles from Members not in the albion guilds
 */
async function clearAlbionMembers() {
  guildMembers = [];
  // if guildIds are not cache, retrieve them
  if(guildIds.length < 1) {
    await searchGuildIds();
  }
  // for each guild id
  for(const guildId of guildIds) {
    // retrieve the members list
    try {
      const body = await doRequest(`${baseUri}guilds/${guildId}/members`);
      addGuildMembers(body);
    } catch {
      return;
    }
  }
  // remove the roles
  let removedPlayers = await removeRoles();
  // print the Players which get removed in each guild this bot is registered with
  for(const guild of discordHandler.client.guilds.cache) {
    const channel = guild[1].channels.cache.find(channel=>channel.name === config.removeChannel);
    messageHandler.sendRichTextDefaultExplicit({
      guild: guild,
      channel: channel,
      title: replaceArgs(language.commands.removeMembers.labels.title, [removedPlayers.length]),
      description: replaceArgs(language.commands.removeMembers.labels.description, [removedPlayers.join('\n')]),
    });
  }
 
  return removedPlayers;
}
/**
 * Adds a guild member name to the list
 * @param {*} body 
 */
function addGuildMembers(body) {
  for(const playerInfo of body) {
    guildMembers.push(playerInfo.Name);
  }
}

/**
 * Removes the roles from the players
 */
async function removeRoles() {
  let removedPlayers = []
  for(const guild of discordHandler.client.guilds.cache) {
    removedPlayers.push(await discordHandler.removeRolesFromPlayers(guild[1], guildMembers));
  }
  return removedPlayers;
}

/**
 * searches Guild Ids
 */
async function searchGuildIds() {
  for(const guildName of config.trackedGuilds) {
    try {
      const body = await doRequest(`${baseUri}${guildSearch}${guildName}`);
      for(const guildInfo of body.guilds) {
        if(config.trackedGuilds.includes(guildInfo.Name)) {
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
 * @return {Promise<*>} 
 */
 function doRequest(url) {
  return new Promise(function (resolve, reject) {
    request({uri: url, json: true,}, function (error, response, body) {
      if(!error && response.statusCode === 200) {
        resolve(body);
      } else {
        console.log('Albion API Error: ', url, error, response.statusCode);
        reject(error);
      }
     
    });
  });
}


export default {
  clearAlbionMembers,
};
import request from 'request';
import config from '../config';
import sqlHandler from './sqlHandler';
import discordHandler from './discordHandler';
import messageHandler from './messageHandler';
import {dic as language, replaceArgs} from './languageHandler.js';
import { restart } from 'nodemon';
const baseUri = 'https://gameinfo.albiononline.com/api/gameinfo/';
const guildSearch = 'search?q=';
let guildIds = [];
let guildMembers = [];

async function clearAlbionMembers() {
  guildMembers = [];
  if(guildIds.length < 1) {
    await searchGuildIds();
  }
  for(const guildId of guildIds) {
    const body = await doRequest(`${baseUri}guilds/${guildId}/members`);
    addGuildMembers(body);
  }
  let removedPlayers = await removeRoles();
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

function addGuildMembers(body) {
  for(const playerInfo of body) {
    guildMembers.push(playerInfo.Name);
  }
}

async function removeRoles() {

  let removedPlayers = []
  for(const guild of discordHandler.client.guilds.cache) {
    removedPlayers.push(await discordHandler.removePlayers(guild[1], guildMembers));
  }
  return removedPlayers;
}

async function searchGuildIds() {
  for(const guildName of config.trackedGuilds) {
    const body = await doRequest(`${baseUri}${guildSearch}${guildName}`);
    for(const guildInfo of body.guilds) {
      if(config.trackedGuilds.includes(guildInfo.Name)) {
        guildIds.push(guildInfo.Id);
      }
    }
  }
  
}

/**
 * 
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
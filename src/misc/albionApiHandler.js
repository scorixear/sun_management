import request from 'request';
import config from '../config';
import sqlHandler from './sqlHandler';
import discordHandler from './discordHandler';
import messageHandler from './messageHandler';
import {dic as language, replaceArgs} from './languageHandler.js';
const baseUri = 'https://gameinfo.albiononline.com/api/gameinfo/';
const guildSearch = 'search?q=';
let guildIds = [];
let guildMembers = [];

function clearAlbionMembers() {
  if(guildIds.length < 1) {
    searchGuildIds();
  }
  console.log('Clearing Discord Members');
  for(const guildId of guildIds) {
    request({
      uri: `${baseUri}guild/${guildId}/members`,
      json: true,
    }, (error, response, body) => {
      if(!error) {
        if(response.statusCode === 200) {
          addGuildMembers(body);
        } else {
          console.log('Albion API Bad Request: ', response, body);
        }
      } else {
        console.log('Albion API Error: ', error);
      }
    });
  }
  removeRoles();
 
}

function addGuildMembers(body) {
  for(playerInfo of body) {
    guildMembers.push(playerInfo.Name);
  }
}

function removeRoles() {
  for(const guild of discordHandler.client.guilds.cache) {
    for(const guildMember of guild[1].members.cache) {
      sqlHandler.findPlayer(guildMember[1].id).then(returnValue => {
        if(!returnValue) {
          guildMember[1].roles.remove(guildMember[1].roles);
          console.log("Removed roles from " + guildMember[1].Name);
        }
      });
    }
  }
}

function searchGuildIds() {
  request({
    uri: `${baseUri}${guildSearch}`,
    json: true,
  }, (error, response, body)=> {
    if(!error) {
      if(response.statusCode === 200) {
        for(const guildInfo of body.guilds) {
          if(config.trackedGuilds.includes(guildInfo.Name)) {
            guildIds.push(guildInfo.Id);
          }
        }
      } else {
        console.log('Albion API Bad Request: '. response, body);
      }
    } else {
      console.log('Albion API Error: ', error);
    }
  });
}

export default {
  clearAlbionMembers,
};
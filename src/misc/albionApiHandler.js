import request from 'request';
import config from '../config';
import sqlHandler from './sqlHandler';
import discordHandler from './discordHandler';
import messageHandler from './messageHandler';
import {dic as language, replaceArgs} from './languageHandler.js';
const baseUri = 'https://gameinfo.albiononline.com/api/gameinfo/';
const guildUri = 'events';

function clearAlbionMembers() {
  
  console.log('Clearing Discord Members');
  request({
    uri: `${baseUri}${guildUri}`,
    json: true,
  }, (error, response, body) => {
    if(!error) {
      if(response.statusCode === 200) {
        removeRoles(body);
      } else {
        console.log('Albion API Bad Request: ', response, body);
      }
    } else {
      console.log('Albion API Error: ', error);
    }
  });
}

function removeRoles(body) {
  
}

export default {
  clearAlbionMembers,
};
import DiscordHandler from './misc/discordHandler.js';
import config from './config.js';
import albionApiHandler from './misc/albionApiHandler';
import CmdHandler from './misc/commandHandler.js';
import SqlHandler from './misc/sqlHandler.js';

DiscordHandler.client.on('ready', () => {
  console.log('SUN Management Bot online!');
  DiscordHandler.client.user.setActivity('🦆Quack');
  setIntervall(()=> {
    albionApiHandler.clearAlbionMembers();
  }, 86400000);
})

DiscordHandler.client.on('message', CmdHandler? CmdHandler.parseCommand: () => {});

SqlHandler.initDB().then(()=>{
  DiscordHandler.client.login(config.token);
});

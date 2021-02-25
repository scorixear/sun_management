// Package imports
import DiscordHandler from './misc/discordHandler.js';
import config from './config.js';
import albionApiHandler from './misc/albionApiHandler';
import CmdHandler from './misc/commandHandler.js';
import SqlHandler from './misc/sqlHandler.js';

// Event when the bot goes online
DiscordHandler.client.on('ready', () => {
  // print welcome message
  console.log('SUN Management Bot online!');
  // set the BOT activity
  DiscordHandler.client.user.setActivity('🦆Quack');
  // start the interval in which the roles of members will be registered.
  setInterval(()=> {
    albionApiHandler.clearAlbionMembers();
  }, 24*60*60*1000);
})

// Event when a message was received over any channel
// call the string to the ParseCommand functions
DiscordHandler.client.on('message', CmdHandler? CmdHandler.parseCommand: () => {});

// Initialize the Database if needed
SqlHandler.initDB().then(()=>{
  // after that login the client to the connected servers
  DiscordHandler.client.login(config.token);
});

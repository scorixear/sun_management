// Package imports
import DiscordHandler from './lib/discordHandler';
import config from './config';
import albionApiHandler from './lib/albionApiHandler';
import CmdHandler from './lib/commandHandler';
import SqlHandler from './lib/sqlHandler';

// Event when the bot goes online
DiscordHandler.client.on('ready', () => {
  // print welcome message
  console.log('SUN Management Bot online!');
  // set the BOT activity
  DiscordHandler.client.user.setActivity('🦆Quack');
  // start the interval in which the roles of members will be registered.
  setInterval(() => {
    albionApiHandler.removeMemberRoles();
  }, 24 * 60 * 60 * 1000);
});

// Event when a message was received over any channel
// call the string to the ParseCommand functions
DiscordHandler.client.on(
  'message',
  CmdHandler ? CmdHandler.parseCommand : () => {}
);

// Initialize the Database
SqlHandler.initDB().then(() => {
  // after that, log the client to the specified server(s)
  DiscordHandler.client.login(config.token);
});

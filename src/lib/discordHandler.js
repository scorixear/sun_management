import Discord from 'discord.js';
import config from '../config';
import sqlHandler from '../lib/sqlHandler';

const client = new Discord.Client();

/**
 * Removes Roles from players
 * @param {Discord.Guild} guild
 * @return {Promise<Discord.GuildMember[]>}}
 */
async function removeRolesFromPlayers(guild, albionMembers) {
  let players = [];
  let guildMembers = await guild.members.fetch();

  for (const guildMember of guildMembers) {
    if (!guildMember[1].user.bot) {
      // find in-game name in sql database
      const albionName = await sqlHandler.findPlayer(guildMember[1].id);
      // if player is not registered or in-game name is not in a sun guild
      console.log(albionMembers);
      if (!albionName || !albionMembers.includes(albionName)) {
        console.log('We are logging');
        // if in-game name is not the ignore role AND the player has at least one role
        if (
          albionName !== config.ignoreRole &&
          guildMember[1].roles.cache.filter((role) => role.name !== '@everyone')
            .size > 0
        ) {
          // if none of the roles are one of the safeRoles
          if (
            !guildMember[1].roles.cache.find((role) => {
              //  console.log(role);
              return config.safeRoles.includes(role.name);
            })
          ) {
            guildMember[1].roles.set([]);
            players.push(guildMember[1]);
          }
        }
      }
    }
  }

  console.log(
    'Removed roles from ',
    players.map((member) => member.displayName)
  );

  return players;
}

export default {
  client,
  removeRolesFromPlayers
};

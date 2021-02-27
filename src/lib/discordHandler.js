import Discord from 'discord.js';
import config from '../config';
import sqlHandler from '../lib/sqlHandler';

const client = new Discord.Client();
/**
 * Removes Roles from players
 * @param {Discord.Guild} guild
 * @return {Promise<Array<String>>}}
 */
async function removeRolesFromPlayers(guild, albionMembers) {
  const players = [];
  const guildMembersCollection = await guild.members.fetch();
  const guildMembersArr = Array.from(guildMembersCollection.flatMap);

  guildMembersArr.map((guildMember) => {
    if (!guildMember[1].user.bot) {
      // find in-game name in sql database
      const albionName = sqlHandler.findPlayer(guildMember[1].id);
      // if player is not registered or in-game name is not in a sun guild
      if (!albionName || !albionMembers.includes(albionName)) {
        const hasMoreThanOneRole =
          guildMember[1].roles.cache.filter((role) => role.name !== '@everyone')
            .size > 0;

        // in-game name is not the ignore role AND the player has at least one role
        if (albionName !== config.ignoreRole && hasMoreThanOneRole) {
          // If the role is not 'safe'
          const isNotSafeRole = !guild.roles.cache.flatMap((role) =>
            config.safeRoles.includes(role.name)
          );

          if (isNotSafeRole) {
            guildMember[1].roles.set([]);
            // Add player to list
            players.push(guildMember[1]);
          }
        }
      }
    }
  });

  console.info(
    `Removed roles from: \n${players.map((member) => member.displayName)}`
  );

  return players;
}

export default {
  client,
  removeRolesFromPlayers
};

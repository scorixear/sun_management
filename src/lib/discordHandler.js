import Discord from 'discord.js'
import config from '../config'
import sqlHandler from '../misc/sqlHandler'

const client = new Discord.Client()
/**
 * Removes Roles from players
 * @param {Discord.Guild} guild
 * @return {Array{string}}
 */
async function removeRolesFromPlayers(guild, albionMembers) {
  let players = []
  let guildMembers = await guild.members.fetch()
  for (const guildMember of guildMembers) {
    if (!guildMember[1].user.bot) {
      // find ingame name in sql database
      const albionName = await sqlHandler.findPlayer(guildMember[1].id)
      // if player is not registered or ingame name is not in a sun guild
      if (!albionName || !albionMembers.includes(albionName)) {
        // if ingame name is not the ignore role AND the player has at least one role
        if (
          albionName !== config.ignoreRole &&
          guildMember[1].roles.cache.filter((role) => role.name !== '@everyone')
            .size > 0
        ) {
          // if none of the roles are one of the saveRoles
          if (
            !guild.roles.cache.find((role) =>
              config.saveRoles.includes(role.name)
            )
          ) {
            guildMember[1].roles.set([])
            players.push(guildMember[1])
          }
        }
      }
    }
  }
  console.log(
    'Removed roles from ',
    players.map((member) => member.displayName)
  )
  return players
}
export default {
  client,
  removeRolesFromPlayers
}

import Discord from 'discord.js';
import sqlHandler from '../misc/sqlHandler';

const client = new Discord.Client();
/**
 * 
 * @param {Discord.Guild} guild 
 */
async function removePlayers(guild, albionMembers) {
  let players = [];
  let guildMembers = await guild.members.fetch();
  for(const guildMember of guildMembers) {
    if(!guildMember[1].user.bot) {
      const albionName = await sqlHandler.findPlayer(guildMember[1].id);
      if(!albionName || !albionMembers.includes(albionName)) {
        if(guildMember[1].roles.cache.filter(role => role.name !== "@everyone").size > 0) {
          guildMember[1].roles.set([]);
          players.push(guildMember[1]);
        }
        
      }
    }
  }
  console.log("Removed roles from ", players.map(member => member.displayName));
  return players;
}
export default {
  client,
  removePlayers,
};


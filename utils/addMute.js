module.exports = async function(ctx, guildId, userId, roles, muteRole) {
     const id = utils.randomGen(16);
     if(typeof roles == `object`) {roles = JSON.stringify(roles)}
     return await ctx.seq.models.Mutes.create({muteId: id, userId, guildId, roles, muteRole})
}
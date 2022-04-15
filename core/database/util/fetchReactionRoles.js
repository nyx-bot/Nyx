module.exports = async function (guildID, raw) {
    if(raw === undefined || typeof raw !== `boolean`) {
         raw = false;
    };
    const g = await ctx.seq.models.serverReactionRole.findAll({where: {id: guildID}, raw});
    return g;
};
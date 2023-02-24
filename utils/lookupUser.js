module.exports = async function (ctx, userID, raw) {
     if(raw === undefined) {
          raw = false;
     }
     let fallback = ctx.seq.models.User.build({id: userID}); if(raw) {fallback = fallback.dataValues}
     return await ctx.seq.models.User.findOne({where: {id: userID}, raw}) || fallback
}
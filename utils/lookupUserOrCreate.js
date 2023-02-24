module.exports = async function (ctx, userID, raw) {
     if(raw === undefined) {
          raw = false;
     }
     let guild = await ctx.seq.models.User.findOne({where: {id: userID}, raw});
     if(!guild) {
          let a = await ctx.seq.models.User.build({id: userID});
          await a.save();
          guild = await ctx.seq.models.User.findOne({where: {id: userID}, raw});
     }
     return guild;
}
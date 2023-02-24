module.exports = async function (ctx, userID, raw) {
     if(raw === undefined) {
          raw = false;
     }
     let fallback = ctx.seq.models.Economy.build({id: userID});
     const g = await ctx.seq.models.Economy.findOne({where: {id: userID}})
     if(raw) {
          if(g) {return g.dataValues} else {return fallback.dataValues}
     } else {
          if(g) {return g} else {return fallback}
     }
}
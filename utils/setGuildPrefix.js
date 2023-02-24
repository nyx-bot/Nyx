module.exports = async function (ctx, guildID, prefix) {
     let thing = await ctx.seq.models.Server.findOne({where: {id: guildID}});
     if(!thing) {
          let a = await ctx.seq.models.Server.build({id: guildID});
          await a.save();
          thing = await ctx.seq.models.Server.findOne({where: {id: guildID}});
     }
     await thing.update(
          {prefix},
          {
               where: {
                    id: guildID,
               },
          }
     );
     thing.save()
          .then((g) => {
               g.oldUpdate = g.update
               g.update = (...args) => new Promise(async (res, rej) => {
                    let rawB = false;
                    if(args[1] && args[1].raw) {raw = true; args[1].raw = false;}
                    g.oldUpdate(...args).then(async r => {
                         res(rawB && r.dataValues ? r.dataValues : r)
                    }).catch(rej)
               }); 
               ctx.bot.guilds.get(guildID).guildSettingRaw = g;
               ctx.bot.guilds.get(guildID).guildSetting = g.dataValues;
               return g.toJSON().prefix;
          });
}
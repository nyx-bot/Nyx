module.exports = async function (ctx, guildID, raw) {
     if(raw === undefined || typeof raw !== `boolean`) {
          raw = false;
     }
     let guild = await ctx.seq.models.Server.findOne({
          where: {id: guildID},
          raw,
     });
     if(!guild) {
          let a = await ctx.seq.models.Server.build({id: guildID});
          await a.save();
          guild = await ctx.seq.models.Server.findOne({
               where: {id: guildID},
               raw,
          });
     }; 
     guild.oldUpdate = guild.update
     guild.update = (...args) => new Promise(async (res, rej) => {
          let rawB = false;
          if(args[1] && args[1].raw) {raw = true; args[1].raw = false;}
          guild.oldUpdate(...args).then(async r => {
               res(rawB && r.dataValues ? r.dataValues : r)
          }).catch(rej)
     }); 
     ctx.bot.guilds.get(guildID).guildSettingRaw = guild;
     ctx.bot.guilds.get(guildID).guildSetting = guild.dataValues;
     return guild;
}
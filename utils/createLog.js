module.exports = async function(ctx, userId, guildId, modId, description, type, duration, meta, group) {
     return new Promise(async function(res, rej) {
          let ab = {
               logID: ctx.utils.randomGen(16),
               userID: userId,
               modID: modId,
               guildID: guildId,
               desc: description,
               logType: type,
               group: group || 1
          };
          if(duration) ab.duration = duration
          if(meta) ab.meta = meta
          let existingWarns;
          if(type == 'warn') {
               existingWarns = await ctx.seq.models[`Modlogging`].findAll({where: {userID: userId, guildID: guildId, logType: `warn`, deleted: false,}, raw: true});
          }
          let a = await ctx.seq.models.Modlogging.build(ab);
          a.save().then(r => {
               let resp = {
                    reason: description,
                    type,
               };
               if(type == `warn`) {resp.warning = existingWarns.length+1}
               return res(resp)
          }).catch(e => {return rej(e)})
     })
}
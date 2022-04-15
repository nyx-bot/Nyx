module.exports = async function (model, userID, raw) {
    if(raw === undefined || typeof raw !== `boolean`) {
         raw = false;
    }
    let guild = await ctx.seq.models[`user` + model[0].toUpperCase() + model.slice(1)].findOne({
         where: {id: userID},
         raw,
    });
    if(!guild) {
         let a = await ctx.seq.models[`user` + model[0].toUpperCase() + model.slice(1)].build({id: userID});
         await a.save();
         guild = await ctx.seq.models[`user` + model[0].toUpperCase() + model.slice(1)].findOne({
              where: {id: userID},
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
    return guild;
};
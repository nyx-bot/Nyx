module.exports = async function (model, guildID, raw) {
    if(raw === undefined || typeof raw !== `boolean`) {
         raw = false;
    };
    let fallback = ctx.seq.models[`server` + model[0].toUpperCase() + model.slice(1)].build({id: guildID});
    const g = await ctx.seq.models[`server` + model[0].toUpperCase() + model.slice(1)].findOne({where: {id: guildID}});
    if(g) {
         g.oldUpdate = g.update
         g.update = (...args) => new Promise(async (res, rej) => {
              let rawB = false;
              if(args[1] && args[1].raw) {raw = true; args[1].raw = false;}
              g.oldUpdate(...args).then(async r => {
                   res(rawB && r.dataValues ? r.dataValues : r)
              }).catch(rej)
         }); 
    }
    if(raw) {
         if(g && g.dataValues) {return g.dataValues} else {return fallback.dataValues}
    } else {
         if(g) {return g} else {return fallback}
    }
};
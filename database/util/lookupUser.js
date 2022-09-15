module.exports = async function (model, userID, raw) {
    if(raw === undefined || typeof raw !== `boolean`) {
         raw = false;
    };
    console.log(ctx.seq.models, [`user` + model[0].toUpperCase() + model.slice(1)])
    let fallback = ctx.seq.models[`user` + model[0].toUpperCase() + model.slice(1)].build({id: userID});
    const g = await ctx.seq.models[`user` + model[0].toUpperCase() + model.slice(1)].findOne({where: {id: userID}});
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
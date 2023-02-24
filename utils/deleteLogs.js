module.exports = async function(ctx, uid, gid, type, logID, full) {
     return new Promise(async function(resolve, reject) {
          let opt = {userID: uid, guildID: gid};
          if(full) {opt.deleted = true} else {opt.deleted = false}
          if(type) opt.logType = type;
          if(logID == undefined) {} else opt.logID = logID
          let prev = await ctx.seq.models[`Modlogging`].findAll({where: opt, raw: true});
          let resObj = {
               deleted: 0,
               type,
          }
          if(prev.length === 0) {
               return resolve(resObj)
          }
          if(logID && prev.length === 1) {resObj.object = prev[0]}
          if(full) {
               ctx.seq.models.Modlogging.destroy({
                    where: opt,
               }).then((r) => {
                    resObj.deleted = prev.length;
                    resObj.fullDelete = true;
                    return resolve(resObj);
               }).catch((e) => {
                    return reject(e);
               });
          }else{
               ctx.seq.models.Modlogging.update({ deleted: true }, {
                    where: opt
               }).then((r) => {
                    resObj.deleted = prev.length;
                    resObj.fullDelete = false;
                    return resolve(resObj);
               }).catch((e) => {
                    return reject(e);
               });
          }
     })
}
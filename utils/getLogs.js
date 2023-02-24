module.exports = async function (ctx, uid, gid, type, allowDeleted, group) {
     return new Promise(async function (resolve, reject) { 
          if(!allowDeleted) {allowDeleted = false;} else {allowDeleted = true;}
          let opts = {group: 1};
          if(uid) opts.userId = uid;
          if(gid) opts.guildId = gid;
          if(type) opts.logType = type;
          if(!isNaN(group)) opts.group = Math.round(group);
          if(group == `all`) {delete opts.group};
          if(allowDeleted === false) opts.deleted = false;
          let res = await ctx.seq.models[`Modlogging`].findAll({where: opts, raw: true})
          return resolve(
               res.sort((a, b) => {
                    a = new Date(a.createdAt).getTime(), b = new Date(b.createdAt).getTime();
                    if(a < b) return 1;
                    if(a > b) return -1;
                    return 0;
               })
          );
     });
}
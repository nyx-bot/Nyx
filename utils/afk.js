module.exports = {
    set: async function (ctx, uid, msg, time) {
         return new Promise(async function (resolve, reject) {
              let user = await ctx.seq.models.Afk.findOne({where: {id: uid}});
              if(!user) user = await ctx.seq.models.Afk.create({id: uid});
              await user.update(
                   {message: msg, date: time || null},
                   {
                        where: {
                             id: uid
                        },
                   }
              );
              user.save()
                   .then((res) => res.dataValues)
                   .then((res) => {
                        return resolve(res.message);
                   })
                   .catch((e) => {
                        return reject(e);
                   });
         });
    },
    remove: async function (ctx, uid) {
         return new Promise(async function (resolve, reject) {
              ctx.seq.models.Afk.destroy({
                   where: {id: uid},
              }).then((r) => {
                   resolve(r);
              }).catch((e) => {
                   reject(e);
              });
         });
    },
    get: async function (ctx, uid) {
         return new Promise(async function (resolve, reject) {
              ctx.seq.models.Afk.findOne({
                   where: {id: uid},
                   raw: true,
              }).then(status => {
                   if(status) {
                        let time;
                        if(status.date) {
                             if(!isNaN(status.date)) {time = Number(status.date)} else {
                                  time = new Date(status.date).getTime();
                             }
                        } else time = new Date(status.updatedAt).getTime();
                        return resolve({message: status.message, time});
                   } else {
                        return resolve(null);
                   }
              }).catch((e) => {
                   reject(e);
              });
         });
    },
}
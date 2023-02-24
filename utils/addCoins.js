module.exports = (ctx, userID, amt) => new Promise(async (res, rej) => {
     if(typeof amt !== `number` && isNaN(amt)) {return rej(new Error(`Amount is not a number!`))} else {
          const u = await utils.lookupEconOrCreate(ctx, userID);
          const r = await u.update({balance: u.dataValues.balance+(Number(amt))}, {
               where: {
                   id: u.dataValues.id
               }
          });
          return res(r.dataValues.balance)
     }
})
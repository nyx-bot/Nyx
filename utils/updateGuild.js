module.exports = async (ctx, id, update) => new Promise(async (res, rej) => {
     const g = await utils.lookupGuildOrCreate(ctx, id);
     g.update(update, {where: {id}}).then(res).catch(rej)
})
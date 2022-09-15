module.exports = async (model, id, update) => new Promise(async (res, rej) => {
    const g = await utils.lookupGuildOrCreate(model, id);
    g.update(update, {where: {id}}).then(res).catch(rej)
})
module.exports = id => new Promise(async res => {
    if(typeof id == `object` && id.id && typeof id.id == `string`) {id = id.id};

    const fallback = ctx.seq.models.userPronouns.build({id: `${id}`});
    const g = await ctx.seq.models.userPronouns.findOne({where: {id: `${id}`}});

    return res(g || fallback)
})
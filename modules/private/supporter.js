module.exports = {
    "name": "supporter",
    "desc": "support ur Momm!!!!",
    func: async function (ctx, msg, args) {
        if(ctx.elevated.find(id => id == msg.author.id)) {
            let id = args[0].match(/\d+/)[0]
            let user = await ctx.utils.lookupUserOrCreate(ctx, id, false)
            let supporterupdatething = true;
            if(user.supporter) {supporterupdatething = false}
            await user.update({supporter: supporterupdatething}, {
                where: {
                    id
                }
            });
            user.save().then(res => res.dataValues).then(res => {
                return msg.reply(`${ctx.pass} Set supporter status of **${id}** to: ${res.supporter}`)
            })
        } 
    }
}
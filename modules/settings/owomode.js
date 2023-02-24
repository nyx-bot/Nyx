module.exports = {
    "name": "owomode",
    "desc": "The worst command in the whole bot; make every reply Nyx sends into OwO",
    "args": [],
    "permission": 2,
    "aliases": [
        "owotoggle",
        "uwumode",
        "uwutoggle"
    ],
    "interactionObject": {},
    func: async (ctx, msg, args) => {
        const g = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id, false)
        if(msg.channel.guild.guildSetting.owomode === false) {
            g.update({ owomode: true }, {where: {
                id: msg.channel.guild.id
            }}).then(r => {
                ctx.bot.guilds.get(msg.channel.guild.id).guildSetting = r.dataValues, ctx.bot.guilds.get(msg.channel.guild.id).guildSettingRaw = r, ctx.bot.guilds.get(msg.channel.guild.id).guildSetting = r.dataValues
                return msg.reply(`${ctx.pass} OwO mode is now ${r.dataValues.owomode === true ? `enabled` : `disabled`}!`)
            })
        } else {
            g.update({ owomode: false }, {where: {
                id: msg.channel.guild.id
            }}).then(r => {
                ctx.bot.guilds.get(msg.channel.guild.id).guildSetting = r.dataValues, ctx.bot.guilds.get(msg.channel.guild.id).guildSettingRaw = r, ctx.bot.guilds.get(msg.channel.guild.id).guildSetting = r.dataValues
                return msg.reply(`${ctx.pass} OwO mode is now ${r.dataValues.owomode === true ? `enabled` : `disabled`}!`)
            })
        }
    }
}
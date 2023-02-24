module.exports = {
    "name": "prefix",
    "desc": "Set the prefix in the server!",
    "args": [
        {
            "opt": false,
            "arg": "new prefix to use"
        }
    ],
    "permission": 2,
    "aliases": [
        "setprefix"
    ],
    func: async function(ctx, msg, args) {
        let guildSetting = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
        if(!args[0]) {
            return msg.reply(`My prefix is currently set to **${msg.prefix.replace(/\*/g, '\\*')}**\nUse \`${msg.prefix}prefix <prefix>\` to change this!`)
        } else {
            if(args.join('').length > 15) return msg.reply(`${ctx.fail} Prefixes can be **at max** 15 characters.`);
            const oldPrefix = guildSetting.dataValues.prefix;
            await guildSetting.update({prefix: args.join('').toLowerCase()}, {
                where: {
                    id: msg.channel.guild.id
                }
            });
            guildSetting.save().then(res => res.toJSON()).then(async res => {
                await ctx.utils.createLog(ctx, msg.author.id, msg.channel.guild.id, msg.author.id, `N/A`, `setprefix`, null, JSON.stringify({
                     "Old Prefix": oldPrefix,
                     "New Prefix": res.prefix,
                }), 2)
                return msg.reply(`${ctx.pass} Successfully set prefix to **${res.prefix.replace(/\*/g, '\\*')}**\n**Tip:** if you ever forget the prefix for this server, or for some reason it is not working properly, you can always <@${ctx.bot.user.id}> as a prefix!`)
            })
        }
    }
}
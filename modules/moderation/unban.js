module.exports = {
    "name": "unban",
    "desc": "Unban a specific user.",
    "args": [
        {
            "opt": false,
            "arg": "@person"
        },
        {
            "opt": true,
            "arg": "reason of the unban"
        }
    ],
    "permission": 2,
    "aliases": [
        "ub",
        "unb",
        "unbanish"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 6,
                "name": "member",
                "description": "The member in question.",
                "required": true
            },
            {
                "type": 3,
                "name": "reason",
                "description": "The reason as to why.",
                "required": false
            }
        ]
    },
    func: async function(ctx, msg, args) {
        if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
        let usrID = args[0].match(/\d+/)
        if(!usrID) return msg.reply(`${ctx.fail} I couldn't find that member!`); usrID = usrID[0];
        await ctx.utils.resolveUser(usrID).then(async person => {
            args.shift();
            let reason = typeof msg.data == `object` && msg.data.options && msg.data.options.find(o => o.name == `reason`) ? msg.data.options.find(o => o.name == `reason`).value : (args.slice(0).join(" ") || "N/A");
            if(reason.length > 250) {return msg.reply(`${ctx.fail} Reasoning can only be **at max** 250 characters!`)};
            const m = await msg.reply(`${ctx.processing} Unbanning **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**...`);
            msg.channel.guild.unbanMember(person.id, reason).then(() => {
                m.edit(`${ctx.pass} **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}** has been unbanned!\n> ${reason.replace(/\n/g, '\n> ')}`);
                const log = ctx.utils.createLog(ctx, person.id, msg.channel.guild.id, msg.author.id, reason, `unban`);
                ctx.bot.emit(`memberUnbanned`, msg.member, person, reason, false);
                ctx.seq.models.Timer.destroy({
                     where: {
                         useId: `${msg.channel.guild.id}`,
                         run: `unban`,
                         exec: `${person.id}`
                     },
                });
            }).catch(e => {
            var error2 = new Error(e)
                if(e) {
                    if(error2.message.includes(`Missing Permissions`)) {
                        m.edit(`${ctx.fail} Failed to unban **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nI don't have permission!`)
                    }
                    if(error2.message.includes(`Unknown Ban`)) {
                        m.edit(`${ctx.fail} Failed to unban **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nThat person is not banned!`)
                    }
                }
                return m.edit(`${ctx.fail} **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}** isn't banned!`)
            })
        }).catch(e => {msg.reply(`${ctx.fail} That person doesn't exist!`)})
    }
}
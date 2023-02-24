module.exports = {
    "name": "ban",
    "desc": "Ban a specific user.",
    "args": [
        {
            "opt": false,
            "arg": "@person"
        },
        {
            "opt": true,
            "arg": "amount of time"
        },
        {
            "opt": true,
            "arg": "reason of the ban"
        }
    ],
    "permission": 2,
    "aliases": [
        "b",
        "banish"
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
                "name": "time",
                "description": "The amount of time the member should be disciplined",
                "required": false
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
        let usrID = await ctx.utils.resolveGuildMember(msg.channel.guild, (msg.mentions && msg.mentions.members.length > 0 ? msg.mentions.members[0].id : args[0]), 'strict');
        let person = msg.channel.guild.members.find(member => member.id == usrID);
        if(!usrID) {
            await ctx.utils.resolveUser(args[0]).then(r => {
                person = r
                args.shift();
            }).catch(e => {return msg.reply(`${ctx.fail} I couldn't find that member!`)})
            usrID = msg.author.id;
        } else {args.shift();}
        const obj = await ctx.utils.getTimeFromArg(typeof msg.data == `object` && msg.data.options && msg.data.options.find(o => o.name == `time`) ? msg.data.options.find(o => o.name == `time`).value.split(` `) : args);
        const time = obj.time;
        let timeToUnb = ``;
        if(time) {
            const timeAAA = await ctx.utils.timeConvert(time)
            timeToUnb = ` for ${timeAAA}`
        }
        args = obj.args
        let reason = typeof msg.data == `object` && msg.data.options && msg.data.options.find(o => o.name == `reason`) ? msg.data.options.find(o => o.name == `reason`).value : (args.slice(0).join(" ") || "N/A");
        if(reason.length > 250) {return msg.reply(`${ctx.fail} Reasoning can only be **at max** 250 characters!`)};
        const m = await msg.reply(`${ctx.processing} Banning **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**...`);
        const modHighest = await ctx.utils.highestRoleNumber(msg.channel.guild, msg.member.roles);
        let memHighest = -1;
        if(person.user) memHighest = await ctx.utils.highestRoleNumber(msg.channel.guild, person.roles)
        const botHighest = await ctx.utils.highestRoleNumber(msg.channel.guild, msg.channel.guild.me.roles);
        if(memHighest >= modHighest) return m.edit(`${ctx.fail} Failed to ban **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nYou can't ban this user, as they have the same (or a higher) role!`);
        if(memHighest >= botHighest) return m.edit(`${ctx.fail} Failed to ban **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nMy role is too low to do this!`);
        let failed = false;
        if(person.user) try {
            await (await person.user.createDM()).createMessage(`**${ctx.utils.escapeDiscordsFuckingEditing(msg.author.username)}** has banned you from **${ctx.utils.escapeDiscordsFuckingEditing(msg.channel.guild.name)}**!\n> ${reason.replace(/\n/g, '\n> ')}`).catch(e => {failed = true});
        } catch(e) { failed = true }
        let ext = ``; if(failed) {ext = `\nI was unable to message them!`}
        async function complete() {
            await ctx.seq.models.Timer.destroy({
                 where: {
                     useId: `${msg.channel.guild.id}`,
                     run: `unban`,
                     exec: `${person.id}`
                 },
            });
            m.edit(`${ctx.pass} **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}** has been banned${timeToUnb}!${ext}\n> ${reason.replace(/\n/g, '\n> ')}`);
            const log = ctx.utils.createLog(ctx, person.id, msg.channel.guild.id, msg.author.id, reason, `ban`, time || undefined);
            if(time) {
                const timer = ctx.utils.addTimer(ctx, {
                    time: Date.now()+time,
                    uid: msg.channel.guild.id,
                    run: `unban`,
                    exec: `${person.id}`
                })
            }
            ctx.bot.emit(`memberBanned`, msg.member, person, reason, time)
        }
        const timeAAA = await ctx.utils.timeConvert(time)
        msg.channel.guild.banMember(person.id, 0, `[${timeAAA}] ${reason}`).then(async a => {
            complete()
        }).catch(err => {
            var error = new Error(err);
            if(error.message.includes('Missing Permissions')) {
                return m.edit(`${ctx.fail} Failed to ban **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nI don\'t have permission!`)
            } else if(error.message.includes("Cannot read property")) {
                return m.edit(`${ctx.fail} Failed to ban **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nUnknown Member`)
            } else complete()
        })
    }
}
module.exports = {
    "name": "mute",
    "desc": "Mute a specific user.",
    "args": [
        {
            "opt": false,
            "arg": "@person"
        },
        {
            "opt": true,
            "arg": "reason of the mute"
        }
    ],
    "permission": 1,
    "aliases": [
        "m",
        "silence"
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
                "description": "The reason as to why this member is being disciplined.",
                "required": false
            }
        ]
    },
    func: async function(ctx, msg, args) {
        if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
        if(!msg.channel.guild.guildSetting.muteRole) return msg.reply(`${ctx.fail} The Muted role hasn't been set yet! Use \`${msg.prefix}muterole <role>\` to set the Muted role!`)
        let usrID = await ctx.utils.resolveGuildMember(msg.channel.guild, (msg.mentions && msg.mentions.members.length > 0 ? msg.mentions.members[0].id : args[0]), 'strict');
        let person = msg.channel.guild.members.find(member => member.id == usrID);
        if(!usrID) {
            return msg.reply(`${ctx.fail} I couldn't find that member!`)
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
        const m = await msg.reply(`${ctx.processing} Muting **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**...`);
        const modHighest = await ctx.utils.highestRoleNumber(msg.channel.guild, msg.member.roles);
        const memHighest = await ctx.utils.highestRoleNumber(msg.channel.guild, person.roles);
        const botHighest = await ctx.utils.highestRoleNumber(msg.channel.guild, msg.channel.guild.me.roles);
        if(memHighest >= modHighest) return m.edit(`${ctx.fail} Failed to mute **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nYou can't mute this user, as they have the same (or a higher) role!`);
        if(memHighest >= botHighest) return m.edit(`${ctx.fail} Failed to mute **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nMy role is too low to do this!`);
        let failed = false;
        try {
            let chnl = await person.user.createDM();
            await chnl.createMessage(`**${ctx.utils.escapeDiscordsFuckingEditing(msg.author.username)}** has muted you from **${ctx.utils.escapeDiscordsFuckingEditing(msg.channel.guild.name)}**!\n> ${reason.replace(/\n/g, '\n> ')}`)
        } catch(e) {failed = true}
        let ext = ``; if(failed) {ext = `\nI was unable to message them!`}
        const aMute = await ctx.seq.models.Mutes.findOne({where: {guildId: msg.channel.guild.id, userId: person.id}, raw: true,})
        if(aMute) {
            await ctx.seq.models.Timer.destroy({
                 where: {
                     meta: aMute.muteId
                 },
            });
            m.edit(`${ctx.pass} **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}** has been muted${timeToUnb}!${ext}\n> ${reason.replace(/\n/g, '\n> ')}`);
            if(time) {
                const timer = ctx.utils.addTimer(ctx, {
                    time: Date.now()+time,
                    uid: msg.channel.guild.id,
                    run: `unmute`,
                    exec: `${person.id}`,
                    meta: `${aMute.muteId}`
                })
            }
            ctx.bot.emit(`memberMuted`, msg.member, person, reason, time)
        } else {
            const prevRoles = JSON.stringify(person.roles).replace(/ /g, '');
            async function complete() {
                await ctx.seq.models.Timer.destroy({
                     where: {
                         useId: `${msg.channel.guild.id}`,
                         run: `unmute`,
                         exec: `${person.id}`
                     },
                });
                await ctx.seq.models.Mutes.destroy({
                    where: {
                        guildId: msg.channel.guild.id, 
                        userId: person.id
                    }
                });
                const mute = await ctx.utils.addMute(ctx, msg.channel.guild.id, person.id, prevRoles, msg.channel.guild.guildSetting.muteRole)
                m.edit(`${ctx.pass} **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}** has been muted${timeToUnb}!\n> ${reason.replace(/\n/g, '\n> ')}`);
                const log = ctx.utils.createLog(ctx, person.id, msg.channel.guild.id, msg.author.id, reason, `mute`, time || undefined, mute.muteId);
                if(time) {
                    const timer = ctx.utils.addTimer(ctx, {
                        time: Date.now()+time,
                        uid: msg.channel.guild.id,
                        run: `unmute`,
                        exec: `${person.id}`,
                        meta: `${mute.dataValues.muteId}`
                    })
                }
                ctx.bot.emit(`memberMuted`, msg.member, person, reason, time)
            }
            person.edit({roles: [`${msg.channel.guild.guildSetting.muteRole}`]}).then(async a => {
                complete()
            }).catch(err => {
                var error = new Error(err);
                console.error(error.message)
                if(error.message.includes('Missing Permissions')) {
                    return m.edit(`${ctx.fail} Failed to mute **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nI don\'t have permission!`)
                } else if(error.message.includes("Cannot read property")) {
                    return m.edit(`${ctx.fail} Failed to mute **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nUnknown Member`)
                } else complete()
            })
        }
    }
}
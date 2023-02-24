module.exports = {
    "name": "unmute",
    "desc": "Unmute a specific user.",
    "args": [
        {
            "opt": false,
            "arg": "@person"
        },
        {
            "opt": true,
            "arg": "reason of the unmuting"
        }
    ],
    "permission": 1,
    "aliases": [
        "um",
        "unsilence"
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
        let usrID = await ctx.utils.resolveGuildMember(msg.channel.guild, (msg.mentions && msg.mentions.members.length > 0 ? msg.mentions.members[0].id : args[0]), 'strict');
        let person = msg.channel.guild.members.find(member => member.id == usrID);
        if(!usrID) {
            return msg.reply(`${ctx.fail} I couldn't find that member!`)
        } else {args.shift();}
        const muteStuff = await ctx.seq.models.Mutes.findOne({where: {guildId: msg.channel.guild.id, userId: person.id}, raw: true,});
        if(!muteStuff) {
            return msg.reply(`${ctx.fail} Either that person isn't muted, or I didn't mute them! (I can't unmute people who I haven't muted)`)
        }
        let reason = typeof msg.data == `object` && msg.data.options && msg.data.options.find(o => o.name == `reason`) ? msg.data.options.find(o => o.name == `reason`).value : (args.slice(0).join(" ") || "N/A");
        if(reason.length > 250) {return msg.reply(`${ctx.fail} Reasoning can only be **at max** 250 characters!`)};
        const m = await msg.reply(`${ctx.processing} Unmuting **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**...`);
        const origroleids = JSON.parse(muteStuff.roles);
        function a() {return new Promise((res, rej) => {
             const roles = [];
             (origroleids).forEach(roleID => {
                  if(msg.channel.guild.roles.find(role => role.id == roleID)) {
                       roles.push(roleID)
                  }
             });
             return res(roles)
        })}
        const roles = await a();
        async function complete() {
            m.edit(`${ctx.pass} **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}** has been unmuted!\n> ${reason.replace(/\n/g, '\n> ')}`);
            const log = ctx.utils.createLog(ctx, person.id, msg.channel.guild.id, msg.author.id, reason, `unmute`);
            ctx.bot.emit(`memberUnmuted`, msg.member, person, reason, false);
            await ctx.seq.models.Mutes.destroy({where: {
                muteId: muteStuff.muteId
            }, raw: true,})
            ctx.seq.models.Timer.destroy({
                 where: {
                     meta: muteStuff.muteId
                 },
            });
        }
        person.edit({roles,}).then(async a => {
            complete()
        }).catch(err => {
            var error = new Error(err);
            if(error.message.includes('Missing Permissions')) {
                return m.edit(`${ctx.fail} Failed to unmute **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nI don\'t have permission!`)
            } else if(error.message.includes("Cannot read property")) {
                return m.edit(`${ctx.fail} Failed to unmute **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nUnknown Member`)
            } else complete()
        })
    }
}
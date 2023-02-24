module.exports = {
    "name": "warn",
    "desc": "Warn a specific user.",
    "args": [
        {
            "opt": false,
            "arg": "@person"
        },
        {
            "opt": true,
            "arg": "reason of the warning"
        }
    ],
    "permission": 1,
    "aliases": [
        "strike",
        "addwarn",
        "w"
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
                "description": "The reason as to why this member is being disciplined.",
                "required": false
            }
        ]
    },
    func: async function(ctx, msg, args) {
        try {
            if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
            let usrID = await ctx.utils.resolveGuildMember(msg.channel.guild, (msg.mentions && msg.mentions.members.length > 0 ? msg.mentions.members[0].id : args[0]), 'strict');
            if(!usrID) return msg.reply(`${ctx.fail} I couldn't find that member!`);
            let person = msg.channel.guild.members.find(member => member.id == usrID);
            let reason = typeof msg.data == `object` && msg.data.options && msg.data.options.find(o => o.name == `reason`) ? msg.data.options.find(o => o.name == `reason`).value : (args.slice(1).join(" ") || "N/A");
            if(reason.length > 250) {return msg.reply(`${ctx.fail} Reasoning can only be **at max** 250 characters!`)};
            const warn = await ctx.utils.createLog(ctx, person.id, msg.channel.guild.id, msg.author.id, reason, `warn`);
            let suffix = 'th'; if(`${warn.warning}` == '1') {suffix = 'st'}; if(`${warn.warning}` == '2') {suffix = 'nd'}; if(`${warn.warning}` == '3') {suffix = 'rd'}; if(warn.warning === 11 || warn.warning === 12 || warn.warning === 13) {suffix = 'th'};
            warn.moderator = msg.author.id;
            warn.person = usrID
            warn.guild = msg.channel.guild.id;
            let failed = false;
            try {
                let dm = await person.user.createDM();
                await dm.createMessage(`**${ctx.utils.escapeDiscordsFuckingEditing(msg.author.username)}** has warned you in **${ctx.utils.escapeDiscordsFuckingEditing(msg.channel.guild.name)}**!\n> ${reason.replace(/\n/g, '\n> ')}`).catch(e => {failed = true;});
            } catch(e) { failed = true }
            let ext = ``; if(failed) {ext = `\nI was unable to message them!`}
            msg.reply(`${ctx.pass} **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}** has been warned! (${warn.warning}${suffix} warning)${ext}\n> ${reason.replace(/\n/g, '\n> ')}`)
            ctx.bot.emit('userWarn', warn, person);
        } catch(e) {console.e(e)}
    }
}
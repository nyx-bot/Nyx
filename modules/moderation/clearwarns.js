module.exports = {
    "name": "clearwarns",
    "desc": "Clear the warnings from a specific user.",
    "args": [
        {
            "opt": false,
            "arg": "@person"
        },
        {
            "opt": true,
            "arg": "reason as to why the warnings are cleared"
        }
    ],
    "permission": 1,
    "aliases": [
        "cw"
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
        if(true) {
            let usrID = await ctx.utils.resolveGuildMember(msg.channel.guild, (msg.mentions && msg.mentions.members.length > 0 ? msg.mentions.members[0].id : args[0]), 'strict');
            let person = msg.channel.guild.members.find(member => member.id == usrID);
            if(!usrID) {
                await ctx.utils.resolveUser(usrID).then(r => {
                    person = r
                    args.shift();
                }).catch(e => {
                    person = msg.member
                })
                usrID = msg.author.id;
            } else {args.shift();}
            let reason = typeof msg.data == `object` && msg.data.options && msg.data.options.find(o => o.name == `reason`) ? msg.data.options.find(o => o.name == `reason`).value : (args.slice(1).join(" ") || "N/A");
            if(reason.length > 250) {return msg.reply(`${ctx.fail} Reasoning can only be **at max** 250 characters!`)};
            const result = await ctx.utils.deleteLogs(ctx, usrID, msg.channel.guild.id, 'warn');
            const log = await ctx.utils.createLog(ctx, person.id, msg.channel.guild.id, msg.author.id, reason, `clearwarns`);
            msg.reply(`${ctx.pass} Successfully cleared **${result.deleted}** warnings from **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**!`)
            result.person = usrID;
            result.guild = msg.channel.guild.id;
            result.reason = reason;
            result.moderator = msg.author.id
            return ctx.bot.emit('clearWarnings', result, person);
        }
    }
}
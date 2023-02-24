module.exports = {
    "name": "delwarn",
    "desc": "Remove a warning from a specific user.",
    "args": [
        {
            "opt": false,
            "arg": "@person"
        },
        {
            "opt": false,
            "arg": "ID of the warning to delete"
        },
        {
            "opt": true,
            "arg": "reasoning of the deletion"
        }
    ],
    "permission": 1,
    "aliases": [
        "dw"
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
                "type": 4,
                "name": "id",
                "description": "The ID of the warn to be removed",
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
        if(true) {
            if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
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
            let id = Math.round(args[0])-1;
            ctx.utils.getLogs(ctx, usrID, msg.channel.guild.id, 'warn').then(async warnlogs => {
                if(id+1 > warnlogs.length || id+1 < 1) return msg.reply(`${ctx.fail} You can only pick an ID from 1 - ${warnlogs.length}!`);
                let idToDelete = warnlogs[id].logID;
                let reason = typeof msg.data == `object` && msg.data.options && msg.data.options.find(o => o.name == `reason`) ? msg.data.options.find(o => o.name == `reason`).value : (args.slice(1).join(" ") || "N/A");
                if(reason.length > 250) {return msg.reply(`${ctx.fail} Reasoning can only be **at max** 250 characters!`)};
                const result = await ctx.utils.deleteLogs(ctx, usrID, msg.channel.guild.id, 'warn', idToDelete);
                const log = await ctx.utils.createLog(ctx, person.id, msg.channel.guild.id, msg.author.id, reason, `delwarn`);
                if(result.deleted !== 0 && result.object) {
                    let obj = result.object;
                    msg.reply(`${ctx.pass} Cleared warning ${id+1} from **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**!\n> ${obj.desc.replace(/\n/g, '\n> ')}`)
                    result.person = person.id;
                    result.wID = id+1
                    result.guild = msg.channel.guild.id;
                    result.reason = reason;
                    result.moderator = msg.author.id;
                    return ctx.bot.emit('deleteWarning', result, person);
                }
            })
        }
    }
}
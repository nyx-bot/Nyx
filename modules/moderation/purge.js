module.exports = {
    "name": "purge",
    "desc": "Purge up to 1,000 messages in a channel!",
    "args": [
        {
            "opt": false,
            "arg": "number",
            "longarg": "number of messages to delete; up to 1,000"
        },
        {
            "opt": true,
            "longarg": "@person to clear messages out of the number provided.",
            "arg": "@person"
        }
    ],
    "permission": 1,
    "aliases": [
        "cleanup",
        "prune"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 4,
                "name": "count",
                "description": "The amount of messages to delete (up to 1,000)",
                "required": true
            },
            {
                "type": 6,
                "name": "member",
                "description": "The member who should have their messages purged.",
                "required": false
            }
        ]
    },
    func: async function(ctx, msg, args) {
        if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
        if(args[0].match(/\d+/)) {args[0] = args[0].match(/\d+/)[0]}
        let member;
        try {
            try {
                let n;
                if(args[1].match(/\d+/)) {n = args[1].match(/\d+/)[0]}
                member = ctx.bot.users.get(n);
                if(!member) member = msg.channel.guild.members.get(n)
                if(!member) member = await ctx.utils.resolveUser(n);
                if(member) {
                    let oldarg1 = args[1];
                    args[1] = args[0];
                    args[0] = oldarg1;
                }
            } catch(e) {
                member = ctx.bot.users.get(args[0]);
                if(!member) member = msg.channel.guild.members.get(args[0])
                if(!member) member = await ctx.utils.resolveUser(args[0]);
            }
        } catch(e) {
            const num = Math.round(args[0]);
            if(num > 1000) return msg.reply(`${ctx.fail} I can only purge up to 1,000 messages at once!`);
            if(num < 1) return msg.reply(`${ctx.fail} I can't purge less than 1 message!`);
            const m = await msg.reply(`${ctx.processing} Fetching ${num} message${num === 1 ? `` : `s`}...`);
            let totalMsgs = await msg.channel.getMessages({limit: num, before: m.id}), msgs = totalMsgs.filter(m => m.timestamp + 1209600000 > Date.now())
            let len = msgs.length;
            let filtered = msgs.filter(m => m.timestamp < Date.now() + 1209600000);
            console.d(`messages fetched: ${msgs.length} total, ${filtered.length} younger than 14d.`);
    
            if(filtered.length === 0) {
                return m.edit(`${ctx.fail} I was unable to fetch ${num - msgs.length}/${num} of the message${num === 1 ? `` : `s`}; they were older than 14 days, which can't be purged due to limitations of Discord.`);
            } else {
                const messagesToDelete = filtered.slice(0).map(m => m.id).reverse()
                await m.edit(`${ctx.processing} Purged ${filtered.length - messagesToDelete.length}/${num} messages...`);
                while (messagesToDelete.length > 0) {
                    try {
                        await msg.channel.deleteMessages(messagesToDelete.splice(0, messagesToDelete.length > 100 ? 100 : messagesToDelete.length));
                    } catch(e) {
                        if(`${e}`.toLowerCase().includes(`permission`)) {messagesToDelete.length = 0; return msg.reply(messagesToDelete.length === filtered.length ? `${ctx.fail} I don't have permission to purge messages!` : `${ctx.fail} I lost permission while I was purging the messages! I was still able to purge **${filtered.length}** message${filtered.length === 1 ? `` : `s`} out of ${len} message${len === 1 ? `` : `s`}...${num - msgs.length === 0 ? `` : `\n> I was unable to fetch ${num - msgs.length}/${num} of the messages; they were older than 14 days, which can't be purged due to limitations of Discord.`}`)} else {return m.edit(`${ctx.fail} ${ctx.errMsg()}`)}
                    }
                    if(messagesToDelete.length > 0) await m.edit(`${ctx.processing} Purged ${filtered.length - messagesToDelete.length}/${num} messages...`);
                }
                await m.edit(`${ctx.pass} Successfully purged **${filtered.length}** message${filtered.length === 1 ? `` : `s`}!${num - msgs.length === 0 ? `` : `\n> I was unable to fetch ${num - msgs.length}/${num} of the messages; they were older than 14 days, which can't be purged due to limitations of Discord.`}`);
                setTimeout(async () => {
                    try {
                        await m.delete()
                    } catch(e) {console.d(`i was unable to delete the messages after it was done.`)}
                }, 5000);
            }
        }; if(member) {
            try {
                const id = member.id;
                let num = 100;
                if(args[1] && args[1].match(/\d+/)) num = Math.round(args[1].match(/\d+/)[0])
                if(num > 1000) return msg.reply(`${ctx.fail} I can only purge up to 1,000 messages at once!`);
                if(num < 1) return msg.reply(`${ctx.fail} I can't purge less than 1 message!`);
                const m = await msg.reply(`${ctx.processing} Fetching ${num} message${num === 1 ? `` : `s`}...`);
                console.d(num + ` to purge from ${member.username}`);
                let totalMsgs = await msg.channel.getMessages({limit: num, before: m.id}), msgs = totalMsgs.filter(m => m.timestamp + 1209600000 > Date.now())
                let len = msgs.length;
                let filtered = msgs.filter(m => m.author.id == id);
                console.d(`messages fetched: ${totalMsgs.length} total, ${msgs.length} usable, ${filtered.length} from specific id.`)
                if(filtered.length === 0) {
                    return m.edit(`${ctx.fail} I wasn't able to find any messages from this person out of ${len} message${len === 1 ? `` : `s`}!${num - msgs.length === 0 ? `` : `\n> I was also unable to fetch ${num - msgs.length}/${num} of the messages; they were older than 14 days, which can't be purged due to limitations of Discord.`}`);
                } else {
                    const messagesToDelete = filtered.slice(0).map(m => m.id).reverse()
                    await m.edit(`${ctx.processing} Purged ${filtered.length - messagesToDelete.length}/${num} message${num === 1 ? `` : `s`}...`);
                    while (messagesToDelete.length > 0) {
                        try {
                            await msg.channel.deleteMessages(messagesToDelete.splice(0, messagesToDelete.length > 100 ? 100 : messagesToDelete.length));
                        } catch(e) {
                            if(`${e}`.toLowerCase().includes(`permission`)) {messagesToDelete.length = 0; return msg.reply(messagesToDelete.length === filtered.length ? `${ctx.fail} I don't have permission to purge messages!` : `${ctx.fail} I lost permission while I was purging the messages! I was still able to purge **${filtered.length}** message${filtered.length === 1 ? `` : `s`} out of ${len} message${len === 1 ? `` : `s`} from **${member.username}**...${num - msgs.length === 0 ? `` : `\n> I was unable to fetch ${num - msgs.length}/${num} of the messages; they were older than 14 days, which can't be purged due to limitations of Discord.`}`)} else {return m.edit(`${ctx.fail} ${ctx.errMsg()}`)}
                        }
                        if(messagesToDelete.length > 0) await m.edit(`${ctx.processing} Purged ${filtered.length - messagesToDelete.length}/${num} messages...`);
                    }
                    await m.edit(`${ctx.pass} Successfully purged **${filtered.length}** message${filtered.length === 1 ? `` : `s`} out of ${len} message${len === 1 ? `` : `s`} from **${member.username}!**${num - msgs.length === 0 ? `` : `\n> I was unable to fetch ${num - msgs.length}/${num} of the messages; they were older than 14 days, which can't be purged due to limitations of Discord.`}`)
                    await msg.channel.deleteMessages().then(async () => {
                        setTimeout(async () => {
                            try {
                                await m.delete()
                            } catch(e) {console.d(`i was unable to delete the messages after it was done.`)}
                        }, 5000);
                    }).catch(async err => {
                        var error = new Error(err);
                        if(error.message.includes('Missing Permissions')) {
                            return m.edit(`${ctx.fail} I don't have permission to purge messages here!`)
                        }
                    })
                }
            } catch(e) {}
        }
    }
}
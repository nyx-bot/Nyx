module.exports = {
    "name": "catch",
    "desc": "Catch a message that was recently deleted!",
    "usage": ";catch [#channel] [@user]",
    "args": [
        {
            "opt": true,
            "arg": "#channel",
            "longarg": "#channel to catch deleted messages in."
        },
        {
            "opt": true,
            "arg": "@user",
            "longarg": "Find the latest message deleted by a certain member"
        }
    ],
    "aliases": [
        "catchmsg",
        "catchmessage",
        "cm",
        "snipe",
        "snipemsg",
        "snipemessage"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 7,
                "name": "channel",
                "description": "The channel of the message to be caught",
                "required": false
            },
            {
                "type": 6,
                "name": "member",
                "description": "The author of the message in question",
                "required": false
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let channel = msg.channel.id,member;
        if(args[0]) {
            if(ctx.bot.users.find(u => u.id == args[0].match(/\d+/)[0])) {
                member = args[0].match(/\d+/)[0]
            } else {
                if(msg.channel.guild.channels.find(c => c.id == args[0].match(/\d+/)[0])) {
                    channel = args[0].match(/\d+/)[0]
                }
            }
        }; if(args[1]) {
            if(ctx.bot.users.find(u => u.id == args[1].match(/\d+/)[0])) {
                member = args[1].match(/\d+/)[0]
            }
        }
        if(!msg.channel.guild.channels.get(channel)) return msg.reply(`${ctx.fail} I can't find the channel provided in this server!`);
        if(ctx.cache.snipedMsgs[channel] && Object.keys(ctx.cache.snipedMsgs[channel]).length > 0) {
            const msgs = Object.entries(ctx.cache.snipedMsgs[channel]).reverse()
            console.d(msgs)
    
            let m = msgs[0][1];
    
            if(member) {
                console.d(`member present; id ${member}`)
                if(msgs.find(o => o[1].author.id == member)) {
                    m = msgs.find(o => o[1].author.id == member)[1]
                } else {
                    return msg.reply(`${ctx.fail} There are no messages from that person deleted in the past 10 minutes that I was able to catch!`)
                }
            }
    
            let deleted;
    
            if(Date.now() - m.deleted > 10000) deleted = await ctx.utils.timeConvert(Date.now() - m.deleted);
    
            let content = m.content;
    
            if(m.attachments.length > 0) {
                if(content) {
                    content += `\n\n**${m.attachments.length} attachment${m.attachments.length == 1 ? `` : `s`}**\n> ${m.attachments.map(a => `${ctx.file} [${a.filename}](${a.link})`).join(`\n> `)}`
                } else {
                    content = `\n\n**${m.attachments.length} attachment${m.attachments.length == 1 ? `` : `s`}**\n> ${m.attachments.map(a => `${ctx.file} [${a.filename}](${a.link})`).join(`\n> `)}`
                }
            };
    
            if(!content) content = `--`
    
            return msg.reply({embeds: [{
                author: {
                    name: m.author.username + `#` + m.author.discriminator,
                    icon_url: m.author.avatarURL
                },
                description: content,
                footer: {
                    text: `Deleted ${deleted ? `~${deleted} ago.` : `recently.`}`
                },
                color: ctx.utils.colors(`random`),
            }]});
        } else msg.reply(`${ctx.fail} There are no messages deleted in the past 10 minutes that I was able to catch!`)
    }
}
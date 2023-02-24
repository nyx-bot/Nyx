module.exports = {
    "name": "welcomechannel",
    "desc": "Set the welcome/leave message channel!",
    "args": [
        {
            "opt": false,
            "arg": "#channel for welcome messages"
        }
    ],
    "permission": 1,
    "interactionObject": {
        "options": [
            {
                "type": 7,
                "name": "channel",
                "description": "The channel that the welcome messages should be posted in!",
                "required": true
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let g = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
        if(!args[0] || !args[0].match(/\d+/) || !args[0].match(/\d+/)[0]) {
            return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
        } else {
            let channel = await msg.channel.guild.channels.find(channel => channel.id == args[0].match(/\d+/)[0])
            if(channel) {
                if(channel.type === 0) {
                    if(g.welcomeChannel == channel.id) return msg.reply(`${ctx.fail} The logging channel was already set to <#${g.welcomeChannel}>!`)
                    await g.update({welcomeChannel: channel.id}, {
                        where: {
                            id: msg.channel.guild.id
                        }
                    });
                    g.save().then(res => res.toJSON()).then(res => {
                        return msg.reply(`${ctx.pass} Successfully set the logging channel to <#${res.welcomeChannel}>`)
                    })
                } else return msg.reply(`${ctx.fail} This channel isn't a **text** channel!`)
            } else return msg.reply(`${ctx.fail} I can't find that channel!`)
        }
    }
}
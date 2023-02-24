module.exports = {
    "name": "createreactionroles",
    "desc": "Create a new set of reaction roles!",
    "args": [
        {
            "opt": false,
            "args": [
                {
                    "opt": false,
                    "arg": "channel"
                },
                {
                    "opt": false,
                    "arg": "name"
                },
            ]
        }
    ],
    "permission": 2,
    "aliases": [
        "newreactionroles",
        "newreactionrole",
        "createreactionrole"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 7,
                "name": "channel",
                "required": true,
                "description": "The text channel to put the reaction role message in!"
            },
            {
                "type": 3,
                "name": "name",
                "required": true,
                "description": "The name for the new reaction role list!"
            }
        ]
    },
    func: async function (ctx, msg, args) {
        if(args.length >= 2) {
            const name = args.slice(1).join(` `)
            const exists = await ctx.utils.reactionRoles.get({ ctx, serverID: msg.channel.guild.id, name });
            if(!exists) {
                let channel = args[0]; 
                
                if(typeof channel == `string`) channel = (channel.match(/\d+/) ? channel.match(/\d+/)[0] : channel);
                console.d(`Channel: ${channel}`)
                if(typeof channel == `string`) channel = msg.channel.guild.channels.get(channel)

                if(!channel) return msg.reply(`${ctx.fail} I can't find this channel!`)

                ctx.utils.reactionRoles.create({ ctx, serverID: msg.channel.guild.id, name, channel }).then(o => {
                    msg.reply(`${ctx.pass} Successfully created a new reaction role system! (ID: ${o.dbEntry.id})\n\nChange the message using \`${msg.prefix}reactionsetmessage ${o.dbEntry.id} {your new message!}\``)
                }).catch(async e => {
                    msg.reply(`${ctx.fail} ` + ctx.errMsg(`Failed to create a reaction role system! (${e})`));
                    if(await ctx.utils.reactionRoles.get({ ctx, serverID: msg.channel.guild.id, name })) {
                        await ctx.utils.reactionRoles.delete({ ctx, serverID: msg.channel.guild.id, name })
                    }
                })
            } else return msg.reply(`${ctx.fail} There's already a reaction role system set up under this name! Either delete the current system or create one under a different name.`)
        } else return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
    }
}
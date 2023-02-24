module.exports = {
    "name": "movereactionroles",
    "desc": "Move a reaction role message from one channel to another!",
    "args": [
        {
            "opt": false,
            "args": [
                {
                    "opt": false,
                    "arg": "id"
                },
                {
                    "opt": false,
                    "arg": "channel"
                },
            ]
        }
    ],
    "permission": 2,
    "interactionObject": {
        "options": [
            {
                "type": 4,
                "name": "id",
                "required": true,
                "description": "The ID of the reaction role system!"
            },
            {
                "type": 7,
                "name": "channel",
                "required": true,
                "description": "The new text channel to put the reaction role message in!"
            },
        ]
    },
    func: async function (ctx, msg, args) {
        if(args.length >= 2) {
            const exists = await ctx.utils.reactionRoles.get({ ctx, serverID: msg.channel.guild.id, id: Number(args[0]) });

            if(exists) try {
                let channel = args[1]; 

                if(typeof channel == `string`) channel = (channel.match(/\d+/) ? channel.match(/\d+/)[0] : channel);
                console.d(`Channel: ${channel}`)
                if(typeof channel == `string`) channel = msg.channel.guild.channels.get(channel)

                if(!channel) return msg.reply(`${ctx.fail} I can't find this channel!`)

                console.d(exists)

                ctx.utils.reactionRoles.message.move({ctx, serverID: msg.channel.guild.id, name: exists.dbEntry.name, channel }).then(() => {
                    msg.reply(`${ctx.pass} Successfully moved the reaction role system to <#${channel.id}>!`)
                }).catch(e => {
                    msg.reply(`${ctx.fail} Failed to move the reaction role system! (${e})`)
                })
            } catch(e) {
                console.error(e);
                return msg.reply(`${ctx.fail} I was unable to edit the message! (${e})`)
            } else return msg.reply(`${ctx.fail} There is no reaction role system set up under this ID!`)
        } else return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
    }
}
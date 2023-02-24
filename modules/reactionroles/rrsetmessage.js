module.exports = {
    "name": "reactionsetmessage",
    "desc": "Change the message of a reaction role system!",
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
                    "arg": "message"
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
                "type": 3,
                "name": "message",
                "required": true,
                "description": "The message for the reaction role list!"
            }
        ]
    },
    func: async function (ctx, msg, args) {
        if(args.length >= 2) {
            const message = args.slice(1).join(` `)

            const exists = await ctx.utils.reactionRoles.get({ ctx, serverID: msg.channel.guild.id, id: Number(args[0]) });

            if(exists) try {
                if(message.length > 1000) return msg.reply(`${ctx.fail} Message length can only be 1,000 characters or less!`)

                const edit = await ctx.utils.reactionRoles.setMessage({ ctx, serverID: msg.channel.guild.id, name: exists.dbEntry.name, content: message })

                msg.reply(`${ctx.pass} Successfully updated message!`)
            } catch(e) {
                console.error(e);
                return msg.reply(`${ctx.fail} I was unable to edit the message! (${e})`)
            } else return msg.reply(`${ctx.fail} There is no reaction role system set up under this ID!`)
        } else return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
    }
}
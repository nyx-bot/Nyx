module.exports = {
    "name": "reactionremoverole",
    "desc": "Remove a role from the desired reaction role system!",
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
                    "arg": "role"
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
                "type": 8,
                "name": "role",
                "required": true,
                "description": "The role to remove from the reaction role list!"
            },
        ]
    },
    func: async function (ctx, msg, args) {
        if(args.length >= 2) {
            const exists = await ctx.utils.reactionRoles.get({ ctx, serverID: msg.channel.guild.id, id: Number(args[0]) });

            if(exists) try {
                const role = typeof args[1] == `string` ? args[1].match(/\d+/) && args[1].match(/\d+/)[0] ? msg.channel.guild.roles.get(args[1].match(/\d+/)[0]) : null : args[1];

                if(!role) return msg.reply(`${ctx.fail} I can't find that role!`)

                const action = ctx.utils.reactionRoles.buttons.remove({ ctx, serverID: msg.channel.guild.id, name: exists.dbEntry.name, role })

                msg.reply(`${ctx.pass} Successfully removed role!`)
            } catch(e) {
                console.error(e);
                return msg.reply(`${ctx.fail} I was unable to edit the message! (${e})`)
            } else return msg.reply(`${ctx.fail} There is no reaction role system set up under this ID!`)
        } else return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
    }
}
module.exports = {
    "name": "deletereactionroles",
    "desc": "Delete a reaction role system!",
    "args": [
        {
            "opt": false,
            "args": [
                {
                    "opt": false,
                    "arg": "id"
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
                "description": "The name for the new reaction role list!"
            }
        ]
    },
    func: async function (ctx, msg, args) {
        if(args[0]) {
            const exists = await ctx.utils.reactionRoles.get({ ctx, serverID: msg.channel.guild.id, id: Number(args[0]) });
            if(exists) {
                await ctx.utils.reactionRoles.delete({ ctx, serverID: msg.channel.guild.id, name: exists.dbEntry.name })

                msg.reply(`${ctx.pass} Successfully deleted reaction role system "${ctx.utils.escapeDiscordsFuckingEditing(exists.dbEntry.name)}" (ID: ${Number(args[0])})`)
            } else return msg.reply(`${ctx.fail} There is no reaction role system under this ID!`)
        } else return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
    }
}
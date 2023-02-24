module.exports = {
    "name": "reactionaddrole",
    "desc": "Add a role to the desired reaction role system!",
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
                {
                    "opt": true,
                    "arg": "emoji"
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
                "description": "The role to add to the reaction role list!"
            },
            {
                "type": 3,
                "name": "emoji",
                "required": false,
                "description": "The emoji to set with this role!"
            }
        ]
    },
    func: async function (ctx, msg, args) {
        if(args.length >= 2) {
            const exists = await ctx.utils.reactionRoles.get({ ctx, serverID: msg.channel.guild.id, id: Number(args[0]) });

            if(exists) try {
                const role = typeof args[1] == `string` ? args[1].match(/\d+/) && args[1].match(/\d+/)[0] ? msg.channel.guild.roles.get(args[1].match(/\d+/)[0]) : null : args[1];

                const roleHeight = role.position
                const botHeight = await ctx.utils.highestRoleNumber(msg.channel.guild, msg.channel.guild.me.roles);

                if(roleHeight >= botHeight) return msg.reply(`${ctx.fail} I'm unable to manage this role because it's higher than my role!`)

                const arg = args.slice(2).join(` `)
                console.d(`emoji arg: ${arg}`)

                const emoji = (/\p{Extended_Pictographic}/u).test(arg) ? {
                    id: null,
                    name: arg
                } : msg.channel.guild.emojis.find(s => {
                    if(arg.split(`:`).slice(-1).join(` `).match(/\d+/) && arg.split(`:`).slice(-1).join(` `).match(/\d+/)[0]) {
                        return s.id == arg.split(`:`).slice(-1).join(` `).match(/\d+/)[0]
                    } else {
                        return s.name == (arg.includes(`:`) ? arg.split(`:`).slice(1, -1).join(`:`) : arg)
                    }
                });

                console.d(`Emoji set to:`, emoji)

                //args.slice(1).length > 0 && !emoji

                if(!role) return msg.reply(`${ctx.fail} I can't find that role!`)

                const action = ctx.utils.reactionRoles.buttons.add({ ctx, serverID: msg.channel.guild.id, name: exists.dbEntry.name, role, emoji })

                msg.reply(`${ctx.pass} Successfully added role!${args.slice(1).length > 0 && !emoji ? `\n\n**NOTE:** I was not able to find an emoji, so I left that blank.` : ``}`)
            } catch(e) {
                console.error(e);
                return msg.reply(`${ctx.fail} I was unable to edit the message! (${e})`)
            } else return msg.reply(`${ctx.fail} There is no reaction role system set up under this ID!`)
        } else return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
    }
}
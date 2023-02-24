module.exports = {
    "name": "autorole",
    "desc": "Add or remove roles from the autorole!",
    "args": [
        {
            "opt": true,
            "arg": "add / remove",
            "args": {
                "opt": false,
                "arg": "@role"
            }
        }
    ],
    "permission": 2,
    "aliases": [
        "autoroles",
        "ar"
    ],
    "interactionObject": {
        "required": false,
        "options": [
            {
                "type": 1,
                "name": "add",
                "description": "Add a role to the list of autoroles",
                "required": false,
                "options": [
                    {
                        "type": 8,
                        "name": "role",
                        "required": true,
                        "description": "The role to add to the autorole list"
                    }
                ]
            },
            {
                "type": 1,
                "name": "remove",
                "description": "Remove a role from the list of autoroles",
                "required": false,
                "options": [
                    {
                        "type": 8,
                        "name": "role",
                        "required": true,
                        "description": "The role to remove from the autorole list"
                    }
                ]
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let guildSetting = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
        let modRoles = JSON.parse(guildSetting.autoRolesList);
        async function a() {
            const roles = await new Promise((res, rej) => {
                const rols = []
                modRoles.forEach(roleID => {
                     if(msg.channel.guild.roles.find(role => role.id == roleID)) {
                        rols.push(roleID)
                     }
                });
                res(rols)
            });
            let roleString
            if(roles.length !== 0) {roleString = `<@&${roles.join('>, <@&')}>`} else {roleString = `None!`}
            let embed = {
                title: `AutoRole`,
                description: `AutoRoles: ${roleString}`,
                footer: {text: `${msg.prefix}help autorole`},
                color: ctx.utils.colors('random'),
            }
            return msg.reply({embed})
        }
        if(!args[0]) a()
        if(!args[1] && (args[0] && args[0].toLowerCase() !== `clear`)) a()
        if(args[0] && (args[0].toLowerCase() == `add` || args[0].toLowerCase() == `create`)) {let roleID = args[1].match(/\d+/)[0];
            if(msg.channel.guild.roles.find(role => role.id == roleID)) {
                if(modRoles.find(role => role == roleID)) return msg.reply(`${ctx.fail} That's already set as an AutoRole!`)
                modRoles.push(roleID);
                let toWrite = JSON.stringify(modRoles);
                await guildSetting.update({autoRolesList: toWrite}, {
                    where: {
                        id: msg.channel.guild.id
                    }
                });
                guildSetting.save().then(res => res.toJSON()).then(res => {
                    return msg.reply(`${ctx.pass} Successfully added **${msg.channel.guild.roles.find(role => role.id == roleID).name}** as an AutoRole!`)
                })
            } else {return msg.reply(`${ctx.fail} That's not a role!`)}
        } else if(args[0] && (args[0].toLowerCase() == `remove` || args[0].toLowerCase() == `del` || args[0].toLowerCase() == `rem` || args[0].toLowerCase() == `rm`)) {let roleID = args[1].match(/\d+/)[0];
            if(msg.channel.guild.roles.find(role => role.id == roleID)) {
                if(!modRoles.find(role => role == roleID)) return msg.reply(`${ctx.fail} I can't find that role!`)
                let pos = modRoles.indexOf(roleID);
                modRoles.splice(pos, 1)
                let toWrite = JSON.stringify(modRoles)
                await guildSetting.update({autoRolesList: toWrite}, {
                    where: {
                        id: msg.channel.guild.id
                    }
                });
                guildSetting.save().then(res => res.toJSON()).then(res => {
                    return msg.reply(`${ctx.pass} Successfully removed **${msg.channel.guild.roles.find(role => role.id == roleID).name}** as an AutoRole!`)
                })
            } else {return msg.reply(`${ctx.fail} That's not a role!`)}
        } else if(args[0] && args[0].toLowerCase() == `clear`) {
            await guildSetting.update({modRoles: `[]`}, {
                where: {
                    id: msg.channel.guild.id
                }
            });
            guildSetting.save().then(res => res.toJSON()).then(res => {
                return msg.reply(`${ctx.pass} Successfully cleared AutoRoles!`)
            })
        }
    }
}
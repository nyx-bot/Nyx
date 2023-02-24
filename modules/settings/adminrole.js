module.exports = {
    "name": "adminrole",
    "desc": "Set an Admin role, or remove one!",
    "args": [
        {
            "opt": false,
            "arg": "add / rm"
        },
        {
            "opt": false,
            "arg": "@role"
        }
    ],
    "permission": 2,
    "aliases": [
        "admin"
    ],
    "allowInDm": false,
    "interactionObject": {
        "options": [
            {
                "type": 1,
                "name": "add",
                "description": "Set a role as an adminrole",
                "options": [
                    {
                        "type": 8,
                        "name": "role",
                        "description": "The role to add",
                        "required": true
                    }
                ]
            },
            {
                "type": 1,
                "name": "remove",
                "description": "Remove a role from the list of adminroles",
                "options": [
                    {
                        "type": 8,
                        "name": "role",
                        "description": "The role to remove",
                        "required": true
                    }
                ]
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let guildSetting = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
        let adminRoles = JSON.parse(guildSetting.adminRoles);
        async function a() {
            const roles = await new Promise((res, rej) => {
                const rols = []
                adminRoles.forEach(roleID => {
                     if(msg.channel.guild.roles.find(role => role.id == roleID)) {
                        rols.push(roleID)
                     }
                });
                res(rols)
            });
            let roleString
            if(roles.length !== 0) {roleString = `<@&${roles.join('>, <@&')}>`} else {roleString = `None!`}
            let embed = {
                title: `Admin roles`,
                description: `Current admin roles: ${roleString}`,
                footer: {text: `${msg.prefix}adminrole add/remove <role>`},
                color: ctx.utils.colors('random'),
            }
            return msg.reply({embed})
        }
        if(!args[0]) a()
        if(!args[1] && (args[0] && args[0].toLowerCase() !== `clear`)) a()
        if(args[0] && (args[0].toLowerCase() == `add` || args[0].toLowerCase() == `create`)) {let roleID = args[1].match(/\d+/)[0];
            if(msg.channel.guild.roles.find(role => role.id == roleID)) {
                if(adminRoles.find(role => role == roleID)) return msg.reply(`${ctx.fail} That's already a Server Admin role!`)
                adminRoles.push(roleID);
                let toWrite = JSON.stringify(adminRoles);
                await guildSetting.update({adminRoles: toWrite}, {
                    where: {
                        id: msg.channel.guild.id
                    }
                });
                guildSetting.save().then(res => res.toJSON()).then(res => {
                    return msg.reply(`${ctx.pass} Successfully added **${msg.channel.guild.roles.find(role => role.id == roleID).name}** as a Server Admin role!`)
                })
            } else {return msg.reply(`${ctx.fail} Invalid role!`)}
        } else if(args[0] && (args[0].toLowerCase() == `remove` || args[0].toLowerCase() == `del` || args[0].toLowerCase() == `rem` || args[0].toLowerCase() == `rm`)) {let roleID = args[1].match(/\d+/)[0];
            if(msg.channel.guild.roles.find(role => role.id == roleID)) {
                if(!adminRoles.find(role => role == roleID)) return msg.reply(`${ctx.fail} That's not a Server Admin role!`)
                let pos = adminRoles.indexOf(roleID);
                adminRoles.splice(pos, 1)
                let toWrite = JSON.stringify(adminRoles)
                await guildSetting.update({adminRoles: toWrite}, {
                    where: {
                        id: msg.channel.guild.id
                    }
                });
                guildSetting.save().then(res => res.toJSON()).then(res => {
                    return msg.reply(`${ctx.pass} Successfully removed **${msg.channel.guild.roles.find(role => role.id == roleID).name}** from being a Server Admin role!`)
                })
            } else {return msg.reply(`${ctx.fail} Invalid role!`)}
        } else if(args[0] && args[0].toLowerCase() == `clear`) {
            await guildSetting.update({adminRoles: `[]`}, {
                where: {
                    id: msg.channel.guild.id
                }
            });
            guildSetting.save().then(res => res.toJSON()).then(res => {
                return msg.reply(`${ctx.pass} Successfully cleared the Muted role!`)
            })
        }
    }
}
module.exports = {
    "name": "djrole",
    "desc": "Set a DJ role, or remove one!",
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
        "dj"
    ],
    "allowInDm": false,
    "interactionObject": {
        "options": [
            {
                "type": 1,
                "name": "add",
                "description": "Set a role as a DJ role",
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
                "description": "Remove a role from the list of DJ roles",
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
        let djRoles = JSON.parse(guildSetting.djRoles);
        async function a() {
            const roles = await new Promise((res, rej) => {
                const rols = []
                djRoles.forEach(roleID => {
                     if(msg.channel.guild.roles.find(role => role.id == roleID)) {
                        rols.push(roleID)
                     }
                });
                res(rols)
            });
            let roleString
            if(roles.length !== 0) {roleString = `<@&${roles.join('>, <@&')}>`} else {roleString = `None!`}
            let embed = {
                title: `DJ roles`,
                description: `Current DJ roles: ${roleString}`,
                footer: {text: `${msg.prefix}djrole add/remove <role>`},
                color: ctx.utils.colors('random'),
            }
            return msg.reply({embed})
        }
        if(!args[0]) a()
        if(!args[1] && (args[0] && args[0].toLowerCase() !== `clear`)) a()
        if(args[0] && (args[0].toLowerCase() == `add` || args[0].toLowerCase() == `create`)) {let roleID = args[1].match(/\d+/)[0];
            if(msg.channel.guild.roles.find(role => role.id == roleID)) {
                if(djRoles.find(role => role == roleID)) return msg.reply(`${ctx.fail} That's already a Server DJ role!`)
                djRoles.push(roleID);
                let toWrite = JSON.stringify(djRoles);
                await guildSetting.update({djRoles: toWrite}, {
                    where: {
                        id: msg.channel.guild.id
                    }
                });
                guildSetting.save().then(res => res.toJSON()).then(res => {
                    return msg.reply(`${ctx.pass} Successfully added **${msg.channel.guild.roles.find(role => role.id == roleID).name}** as a Server DJ role!`)
                })
            } else {return msg.reply(`${ctx.fail} That's not a Server DJ role!`)}
        } else if(args[0] && (args[0].toLowerCase() == `remove` || args[0].toLowerCase() == `del` || args[0].toLowerCase() == `rem` || args[0].toLowerCase() == `rm`)) {let roleID = args[1].match(/\d+/)[0];
            if(msg.channel.guild.roles.find(role => role.id == roleID)) {
                if(!djRoles.find(role => role == roleID)) return msg.reply(`${ctx.fail} I can't find that role!`)
                let pos = djRoles.indexOf(roleID);
                djRoles.splice(pos, 1)
                let toWrite = JSON.stringify(djRoles)
                await guildSetting.update({djRoles: toWrite}, {
                    where: {
                        id: msg.channel.guild.id
                    }
                });
                guildSetting.save().then(res => res.toJSON()).then(res => {
                    return msg.reply(`${ctx.pass} Successfully removed **${msg.channel.guild.roles.find(role => role.id == roleID).name}** from being a Server DJ role!`)
                })
            } else {return msg.reply(`${ctx.fail} That's not a Server DJ role!`)}
        } else if(args[0] && args[0].toLowerCase() == `clear`) {
            await guildSetting.update({djRoles: `[]`}, {
                where: {
                    id: msg.channel.guild.id
                }
            });
            guildSetting.save().then(res => res.toJSON()).then(res => {
                return msg.reply(`${ctx.pass} Successfully cleared Server DJ roles!`)
            })
        }
    }
}
module.exports = {
    "name": "muterole",
    "desc": "Set the Muted role!",
    "args": [
        {
            "opt": false,
            "arg": "@role / clear"
        }
    ],
    "permission": 2,
    "aliases": [
        "mr"
    ],
    "allowInDm": false,
    "interactionObject": {
        "options": [
            {
                "type": 8,
                "name": "role",
                "description": "The role to be set as the muted role",
                "required": true
            }
        ]
    },
    func: async function(ctx, msg, args) {
        if(args[0].toLowerCase() == `add`) args.shift();
        let guildSetting = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
        let muteRole = guildSetting.muteRole
        if(!args[0]) {return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)} else {
            const arg = args[0].toLowerCase()
            if(args[0].match(/\d+/) && msg.channel.guild.roles.find(role => role.id == args[0].match(/\d+/)[0])) {
                const roleID = args[0].match(/\d+/)[0]
                if(muteRole == roleID) return msg.reply(`${ctx.fail} That's already the Muted role!`)
                let toWrite = roleID;
                await guildSetting.update({muteRole: toWrite}, {
                    where: {
                        id: msg.channel.guild.id
                    }
                });
                guildSetting.save().then(res => res.toJSON()).then(res => {
                    return msg.reply(`${ctx.pass} Successfully set **${msg.channel.guild.roles.find(role => role.id == roleID).name}** as the Muted role!`)
                })
            } else if(arg == `clear` || arg == `remove` || arg == `rm`) {
                await guildSetting.update({muteRole: null}, {
                    where: {
                        id: msg.channel.guild.id
                    }
                });
                guildSetting.save().then(res => res.toJSON()).then(res => {
                    return msg.reply(`${ctx.pass} Successfully cleared the Muted role!`)
                })
            } else {return msg.reply(`${ctx.fail} That's not a role!`)}
        }
    }
}
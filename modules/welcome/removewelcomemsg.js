module.exports = {
    "name": "removewelcomemsg",
    "desc": "Remove a specific welcome message!",
    "args": [
        {
            "opt": false,
            "arg": "position of welcome message to remove (1 - 3)"
        }
    ],
    "aliases": [
        "removewelcome",
        "rmwelcomemsg",
        "rmwelcomemessage",
        "delwelcome"
    ],
    "permission": 1,
    "interactionObject": {
        "options": [
            {
                "type": 4,
                "name": "message",
                "description": "The message to be removed from the list of welcome responses!",
                "required": true,
                "choices": [
                    {
                        "name": "1",
                        "value": 1
                    },
                    {
                        "name": "2",
                        "value": 2
                    },
                    {
                        "name": "3",
                        "value": 3
                    }
                ]
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let guildSetting = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
        if(isNaN(args[0])) {return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)} else {
            let num = Math.round(args[0]);
            let ass = JSON.parse(guildSetting.welcomeMsg);
            if(ass.length === 0) {return msg.reply(`${ctx.fail} You have no welcome messages set!\nTo add a welcome message, use \`${msg.prefix}addwelcomemsg <message>\``)}
            if(num > ass.length) {return msg.reply(`${ctx.fail} You can't delete message ${num}/${ass.length}, because it doesn't exist!`)}
            let removedmsg = ass[num-1]
            ass.splice(num-1, 1)
            await guildSetting.update({welcomeMsg: JSON.stringify(ass)}, {
                where: {
                    id: msg.channel.guild.id
                }
            });
            guildSetting.save().then(res => res.toJSON()).then(res => {let thing = JSON.parse(guildSetting.welcomeMsg); id = thing.length-1; let message = thing[id]
                return msg.reply(`${ctx.pass} Successfully removed welcome message:\n> ${removedmsg.replace(/\n/g, '\n> ')}`)
            })
        }
    }
}
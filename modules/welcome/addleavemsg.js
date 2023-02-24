module.exports = {
    "name": "addleavemsg",
    "desc": "Set the leave messages!",
    "args": [
        {
            "opt": false,
            "arg": "new farewell message"
        }
    ],
    "aliases": [
        "setleave",
        "leavemessage",
        "setleavemsg",
        "leavemessage",
        "addleave"
    ],
    "permission": 1,
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "message",
                "description": "The message to be added to the list of leave responses!",
                "required": true
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let guildSetting = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
        if(!args[0]) {return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)} else {
            let ass = JSON.parse(guildSetting.leaveMsg);
            if(ass.length === 3) {return msg.reply(`${ctx.fail} You can't have more than 3 messages!\nTo delete one, use \`${msg.prefix}leavemsg delete [pos]\``)}
            if(args.join(' ').length > 400) {return msg.reply(`${ctx.fail} This message is too long! Try keeping it 400 characters and under`)}
            ass.push(args.join(' '));
            await guildSetting.update({leaveMsg: JSON.stringify(ass)}, {
                where: {
                    id: msg.channel.guild.id
                }
            });
            guildSetting.save().then(res => res.toJSON()).then(res => {let thing = JSON.parse(guildSetting.leaveMsg); id = thing.length-1; let message = thing[id]
                return msg.reply(`${ctx.pass} Successfully added leave message:\n> ${message.replace(/\n/g, '\n> ')}`)
            })
        }
    }
}
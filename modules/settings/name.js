module.exports = {
    "name": "name",
    "desc": "Set your own name for the bot's usage!",
    "args": [
        {
            "opt": false,
            "arg": "new nickname for nyx to refer to you by"
        }
    ],
    "aliases": [
        "setname"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "name",
                "description": "The nickname you want me to refer to you by",
                "required": true
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let userSetting = await ctx.utils.lookupUserOrCreate(ctx, msg.author.id);
        if(!args[0]) {return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)} else {
            await userSetting.update({name: args.join(' ')}, {
                where: {
                    id: msg.author.id
                }
            });
            userSetting.save().then(res => res.toJSON()).then(res => {
                return msg.reply(`${ctx.pass} Successfully set name to **${res.name}!**`)
            })
        }
    }
}
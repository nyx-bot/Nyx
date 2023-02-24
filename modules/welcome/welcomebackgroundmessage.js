module.exports = {
    "name": "welcomebackgroundmessage",
    "desc": "Set a custom message to show on the image when someone joins!",
    "permission": 1,
    "aliases": [
        "welcomebgmsg"
    ],
    "args": [
        {
            "opt": true,
            "arg": "message to put on your welcome images"
        }
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "message",
                "description": "The message to be set as the image's subtext!",
                "required": false
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let guildSetting = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
        if(!args[0]) {
            ctx.cache[`confirm${msg.author.id}`] = {
                guild: msg.channel.guild.id,
                run: (ctx, msg, args) => require('fs').rm(`./etc/backgrounds/${msg.channel.guild.id}`, async () => {
                    await guildSetting.update({welcomeImgMsg: args.join(` `)}, {
                        where: {
                            id: msg.channel.guild.id
                        }
                    });
                    guildSetting.save().then(res => res.toJSON()).then(res => {
                        return msg.reply(`${ctx.pass} Successfully deleted your welcome image's message!\n\n> Every welcome message from now on will be a generic "welcome to this server!" message, unless you disable the images with \`${msg.prefix}welcomebackground\` as well.\n> \n> As a reminder, you can always set a new one using \`${msg.prefix}${this.usage.replace(';', '')}\`!`)
                    })
                })
            };
    
            msg.reply(`Do you want to remove your image message? You can always set a new one using \`${msg.prefix}${this.usage.replace(';', '')}\`!\n\n> To confirm the deletion, run the \`${msg.prefix}confirm\` command.`)
            
            //return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
        } else {
            if(args.join(' ').length > 50) {return msg.reply(`${ctx.fail} This message is too long! Try keeping it 50 characters and under`)}
            await guildSetting.update({welcomeImgMsg: args.join(` `)}, {
                where: {
                    id: msg.channel.guild.id
                }
            });
            guildSetting.save().then(res => res.toJSON()).then(res => {
                return msg.reply(`${ctx.pass} Successfully set image message:\n> ${res.welcomeImgMsg.replace(/\n/g, '\n> ')}`)
            })
        }
    }
}
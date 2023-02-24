module.exports = {
    "name": "removewelcomebackground",
    "desc": "Remove the background for your welcome messages, if one exists.",
    "aliases": [
        "delwelcomebackground",
        "deletewelcomebackground",
        "rmwelcomebackground",
        "rmwelcomebg",
        "removewelcomebg"
    ],
    "permission": 1,
    "interactionObject": {},
    func: async function(ctx, msg, args) {
        require('fs').readdir(`./etc/backgrounds`, async (e, ids) => {
            if(e) {
                return msg.reply(`<:NyxCry:942164350981009458> You have no welcome image set!\n\nTo set a welcome image, upload one while running the \`${msg.prefix}welcomebackground\` command!`)
            } else {
                const thisServer = ids.find(i => i.startsWith(msg.channel.guild.id))
                if(thisServer) {
                    console.log(thisServer);
    
                    ctx.cache[`confirm${msg.author.id}`] = {
                        guild: msg.channel.guild.id,
                        run: (ctx, msg, args) => require('fs').rm(`./etc/backgrounds/${thisServer}`, () => {
                            msg.reply(`${ctx.pass} Successfully deleted your welcome image!\n\n> Every welcome message from now on will be just text messages. You can always set a new image using the \`${msg.prefix}welcomebackground\` command!`)
                        })
                    }
    
                    return msg.reply({
                        embeds: [
                            {
                                title: `Delete image`,
                                description: `Are you sure you'd like to delete this image? **This action is irreversible!**\n\n> To confirm the deletion, run the \`${msg.prefix}confirm\` command.`,
                                image: {
                                    url: `https://nyx.bot/api/welcomeBackground/${msg.channel.guild.id}`
                                },
                                color: ctx.utils.colors(`red`)
                            }
                        ]
                    })
                } else {
                    return msg.reply(`<:NyxCry:942164350981009458> You have no welcome image set!\n\nTo set a welcome image, upload one while running this command!`)
                }
            }
        })
    }
}
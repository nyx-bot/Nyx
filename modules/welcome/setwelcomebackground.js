module.exports = {
    "name": "setwelcomebackground",
    "desc": "Set the background for your welcome messages!",
    "args": [
        {
            "opt": true,
            "arg": "image to use"
        }
    ],
    "aliases": [
        "addwelcomeimage",
        "welcomeimage",
        "setwelcomeimage",
        "welcomebackground",
        "setwelcomebg",
        "welcomebg"
    ],
    "permission": 1,
    "interactionObject": {
        "options": [
            {
                "type": 11,
                "name": "image",
                "required": false,
                "description": "The image to use as the welcome image's background"
            }
        ]
    },
    func: async function(ctx, msg, args) {
        const allowedExtensions = [ `jpg`, `jpeg`, `png`, `gif`, `bmp`, `tiff` ]
        const regex = new RegExp(`\\.(${allowedExtensions.join(`|`)})$`)
        const usableAttachments = msg.attachments.filter(a => a.url.match(regex))
        if(usableAttachments.length > 0) {
            const file = usableAttachments[0];
            if((file.size / 1e+6) > 8.5) {
                return msg.reply(`${ctx.fail} Please make sure your image is under 8MB! (this image is ~${Math.round(file.size / 1e+6)}MB large!)`)
            } else {
                await msg.reply(`${ctx.processing} Setting background image...`)
                if(!require('fs').existsSync(`./etc/backgrounds/`)) require('fs').mkdirSync(`./etc/backgrounds`);
    
                require('fs').readdir(`./etc/backgrounds`, async (e, ids) => {
                    const thisServer = (ids || []).find(i => i.startsWith(msg.channel.guild.id));
    
                    require('superagent').get(file.url).pipe(require('fs').createWriteStream(`./etc/backgrounds/${msg.channel.guild.id}` + file.url.match(regex)[0])).once(`finish`, () => {
                        msg.reply({
                            content: `${ctx.pass} Successfully updated your welcome background message!${!thisServer ? `\n\n> From now on, this server's welcome messages will now generate a picture on every join!` : ``}`
                        })
                    })
                })
            }
        } else if(usableAttachments.length !== msg.attachments.size) {
            if(msg.attachments.size === 1) {
                return msg.reply(`${ctx.fail} The file you uploaded is not usable as an image. The image must be one of the following types: \`${allowedExtensions.join(`\`, \``)}\``)
            } else {
                return msg.reply(`${ctx.fail} None of your attachments are usable as a background image! The image must be one of the following types: \`${allowedExtensions.join(`\`, \``)}\``)
            }
        } else require('fs').readdir(`./etc/backgrounds`, async (e, ids) => {
            if(e) {
                return msg.reply(`<:NyxCry:942164350981009458> You have no welcome image set!\n\nTo set a welcome image, upload one while running this command!`)
            } else {
                const thisServer = ids.find(i => i.startsWith(msg.channel.guild.id))
                if(thisServer) {
                    return msg.reply({
                        embeds: [
                            {
                                title: `Welcome images`,
                                description: `This server currently has a background set for welcome messages.\n\n> To replace this image, run \`${msg.prefix}${this.usage.replace(';', '')}\` with an image attached!\n> \n> To delete your welcome image, run the \`${msg.prefix}removewelcomebackground\` command!`,
                                image: {
                                    url: `https://nyx.bot/api/welcomeBackground/${msg.channel.guild.id}`
                                },
                                color: ctx.utils.colors(`random`)
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
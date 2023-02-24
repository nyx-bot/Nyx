module.exports = {
    "name": "nyxify",
    "desc": "Turn a specified image, or your profile picture, into a Nyx-like avatar!",
    "args": [
        {
            "opt": true,
            "arg": "url, @person, or a file upload"
        }
    ],
    "aliases": [
        "nyxavatar",
        "nyxav"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 6,
                "name": "person",
                "description": "The person to nyx-ify!",
                "required": false
            },
            {
                "type": 3,
                "name": "coloring",
                "description": "Whether or not your image should be shaded with my purple gradient!",
                "choices": [
                    {
                        "name": "Shaded",
                        "value": "color"
                    },
                    {
                        "name": "Original Coloring",
                        "value": "--"
                    }
                ],
                "required": false
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let imgreg = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|bmp|tiff|png)(\?*?)/
        let imgurl, id, color = false
        if(args.find(a => a.toLowerCase() == `color`)) {args.splice(args.indexOf(`color`), 1); color = true};
        if(args.find(a => a.toLowerCase() == `--`)) {args.splice(args.indexOf(`--`), 1); color = true};
        if(!args[0] && msg.attachments.size === 0 && imgreg.test(msg.author.avatarURL)) {
            id = msg.author.id
            imgurl = msg.author.avatarURL;
        } else if(args[0] && imgreg.test(args[0])) {
            const a = args[0].split('/'); b = (a[a.length-1]); c = b.split('.'); id = encodeURI(c[0])
            imgurl = args[0]
        } else if(msg.attachments.size !== 0 && msg.attachments[0] && msg.attachments[0].url && imgreg.test(msg.attachments[0].url)) {
            const a = msg.attachments[0].url.split('/'); b = (a[a.length-1]); c = b.split('.'); c.pop(); id = encodeURI(c[0])
            imgurl = msg.attachments[0].url
        } else if(msg.mentions && msg.mentions.members.length !== 0) {
            console.log(msg.mentions.members[0])
            id = msg.mentions.members[0].id
            imgurl = `https://cdn.discordapp.com/avatars/${msg.mentions[0].id}/${msg.mentions[0].user.avatar}.png?size=2048`
        } else if(!imgurl) return msg.reply(`${ctx.fail} Either upload an image or provide an image url!`);
        const m = await msg.reply(`${ctx.processing} Creating your image...`)
        ctx.libs.superagent.post(`https://nyx.bot/api/v1/nyxify`).set(`authorization`, ctx.keys.nyxbotapi).send({url: imgurl, id, color}).then(r => r.body).then(r => {
            m.edit({content: `${ctx.pass} Here is your nyx-ified image! \nIf you don't see the image, please make sure I can send embeds here!`, embeds: [{
                description: `[**__Link to image__**](${r.url})`,
                image: {
                    url: r.url
                },
                color: ctx.utils.colors('random')
            }]})
        })
    }
}
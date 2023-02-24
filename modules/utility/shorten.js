module.exports = {
    "name": "shorten",
    "desc": "Shorten an inputted URL!",
    "args": [
        {
            "opt": false,
            "arg": "URL to be shortened"
        },
        {
            "opt": true,
            "arg": "short URL vanity"
        }
    ],
    "example": "`;shorten https://nyx.bot/invite invite`\n\nShorten the URL \"https://nyx.bot/invite\" with \"https://awou.me/invite\"",
    "aliases": [
        "short",
        "shorturl",
        "shortenurl",
        "shortifyurl",
        "shortify"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "url",
                "description": "The URL to be shortened",
                "required": true
            },
            {
                "type": 3,
                "name": "vanity",
                "description": "The text to replace the randomly generated URL (if needed)",
                "required": false
            }
        ]
    },
    func: async function(ctx, msg, args) {
        if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
        var shortenedurl = args[0]; let vanity;
        if(args[1]) {vanity = args.splice(1).join('-').toLowerCase()}
        let apiI = {
            title: `Contacting API...`,
            fields: [
                {
                    name: `**LONG URL:**`,
                    value: `\`${shortenedurl}\``,
                    inline: true,
                },
                {
                    name: `**SHORT URL:**`,
                    value: `https://awou.me/${ctx.processing}`,
                    inline: true,
                }
            ],
            color: ctx.utils.colors(`purple_medium`),
        }
        const m = await msg.reply({content: `${ctx.processing} *Shortening URL...*`, embeds: [apiI]});
        ctx.utils.shortUrl(ctx, shortenedurl, msg.author.id, vanity).then(r => {
            apiI = {
                title: `${r.sitename}`,
                fields: [
                    {
                        name: `**LONG URL:**`,
                        value: `\`${r.request}\``,
                        inline: true,
                    },
                    {
                        name: `**SHORT URL:**`,
                        value: `${r.result}`,
                        inline: true,
                    }
                ],
                color: ctx.utils.colors(`random`),
            };
            return m.edit({content: `*Completed in ${r.time}s.*`, embeds: [apiI]})
        }).catch(e => {
            apiI = {
                title: `Failed to shorten URL!`,
                description: ctx.errMsg(),
                fields: [
                    {
                        name: `**LONG URL:**`,
                        value: `\`${shortenedurl}\``,
                        inline: true,
                    },
                    {
                        name: `**SHORT URL:**`,
                        value: `https://awou.me/--`,
                        inline: true,
                    }
                ],
                color: ctx.utils.colors(`red_light`),
            }
        })
    }
}
module.exports = {
    "name": "ping",
    "desc": "pong!",
    "args": [],
    "aliases": [
        "latency"
    ],
    "interactionObject": {},
    func: async function(ctx, msg, args) {
        msg.reply("Pinging...").then(message => {
            let timeforrec = message.timestamp - msg.timestamp
            let timeprocessed = Date.now() - msg.beginProcess
            let pingembed2 = {
                title: `**Ping**`,
                fields: [
                    {
                        name: `**API Latency**`,
                        value: `\`\`\`` + msg.channel.guild.shard.latency + `ms\`\`\``,
                        inline: true,
                    },
                    {
                        name: `**Time to Respond**`,
                        value: `\`\`\`${timeforrec}ms\`\`\``,
                        inline: true,
                    },
                ],
                color: ctx.utils.colors(`purple_dark`)
            }
            message.edit({content: `Pong! ${timeprocessed}ms processing time`, embeds: [pingembed2]})
        })
    }
}
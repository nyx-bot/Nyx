module.exports = (msg, args, lang) => {
    const startTime = Date.now();

    msg.reply({
        content: lang.pinging
    }).then(m => m.edit({
        content: lang.complete,
        embeds: [
            {
                color: ctx.utils.nyxColors(`random`),
                title: lang.pingTitle,
                fields: [
                    {
                        name: lang.discordPing,
                        value: "```\n" + msg.channel.guild.shard.latency + `ms` + "\n```",
                        inline: true,
                    },
                    {
                        name: lang.timeToRespond,
                        value: "```\n" + `${Date.now() - startTime}` + `ms` + "\n```",
                        inline: true
                    }
                ]
            }
        ]
    }))
}
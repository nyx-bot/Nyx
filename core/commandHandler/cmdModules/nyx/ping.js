const func = async (interaction) => {
    let start = Date.now();

    const color = ctx.utils.colors(`random`)

    interaction.reply({ 
        content: "Pinging...",
        embeds: [
            new ctx.libs.builder.Embed()
            .setTitle(`**Ping**`)
            .addField({
                name: `**API Latency**`,
                value: `\`\`\`${interaction.guild.shard.ping}ms\`\`\``,
                inline: true
            })
            .addField({
                name: `**Time to Respond**`,
                value: `\`\`\`--ms\`\`\``,
                inline: true,
            })
            .setColor(color)
        ]
    }).then(async () => {
        let timeprocessed = Date.now() - start
        const message = await interaction.fetchReply()
        let now = message.createdTimestamp
        let timeforrec = now - interaction.createdTimestamp
        interaction.editReply({ 
            content: `Pong! ${timeprocessed}ms processing time`, 
            embeds: [
                new ctx.libs.builder.Embed()
                .setTitle(`**Ping**`)
                .addField({
                    name: `**API Latency**`,
                    value: `\`\`\`` + interaction.guild.shard.ping + `ms\`\`\``,
                    inline: true,
                })
                .addField({
                    name: `**Time to Respond**`,
                    value: `\`\`\`${timeforrec}ms\`\`\``,
                    inline: true,
                })
                .setColor(color)
            ] 
        })
    })
}

module.exports = {
    func,
    interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
        .setDescription(`Measure the latency (or delay) between the command and the response.`)
        .setDefaultPermission(true)
}
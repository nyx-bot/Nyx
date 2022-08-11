const func = async (interaction) => {
    const embed = new ctx.libs.builder.EmbedBuilder();
    embed.setTitle(`**${interaction.langFile.responses[`in-embed`].stats}**`)
    embed.setDescription(interaction.langFile.responses[`in-embed`][`shard-number`].replace(/%server%/g, `**${ctx.utils.escape(interaction.guild.name)}**`).replace(/%shard%/g, `**${interaction.guild.shard.id}**`));
    embed.setColor(ctx.utils.colors('random'))

    const stats = await require('../../../../util/stats').fetch()

    embed.addFields([
        {
            name: `${ctx.emojis.nyxWhite} ${interaction.langFile.responses[`in-embed`].servers}`,
            value: `${interaction.langFile.responses[`in-embed`][`this-shard`].replace(/%num%/g, stats.serversOnThisShard)}\n${interaction.langFile.responses[`in-embed`][`all-shards`].replace(/%num%/g, stats.totalServers)}`,
            inline: true,
        },
        {
            name: `${ctx.emojis.nyxWhite} ${interaction.langFile.responses[`in-embed`].users}`,
            value: `${interaction.langFile.responses[`in-embed`][`this-shard`].replace(/%num%/g, stats.membersOnThisShard)}\n${interaction.langFile.responses[`in-embed`][`all-shards`].replace(/%num%/g, stats.totalMembers)}`,
            inline: true,
        },
        {
            name: `:gear: ${interaction.langFile.responses[`in-embed`].events.events}`,
            value: `${interaction.langFile.responses[`in-embed`].events[`per-second`].replace(/%num%/g, stats.eventsPerSecondOnThisShard)}, ${interaction.langFile.responses[`in-embed`].events[`per-hour`].replace(/%num%/g, stats.eventsPerHourOnThisShard)} on this shard\n${interaction.langFile.responses[`in-embed`].events[`per-second`].replace(/%num%/g, stats.totalEventsPerSecond)}, ${interaction.langFile.responses[`in-embed`].events[`per-hour`].replace(/%num%/g, stats.totalEventsPerHour)} across all shards`,
            inline: true,
        },
        {
            name: `:musical_note: ${interaction.langFile.responses[`in-embed`].music.playing}`,
            value: `${(1 === 1 ? interaction.langFile.responses[`in-embed`].music[`one-server`] : interaction.langFile.responses[`in-embed`].music[`more-than-one-server`]).replace(/%num%/g, 1)}`,
            inline: true,
        },
        {
            name: `${ctx.emojis.nyxWhite} ${interaction.langFile.responses[`in-embed`].version}`,
            value: `Nyx v${require('../../../../package.json').version}`,
            inline: true,
        },
        {
            name: `${ctx.emojis.icons.nodejs} ${interaction.langFile.responses[`in-embed`][`discord-js-version`]}`,
            value: `v${require('../../../../package.json').dependencies['discord.js'].replace('^', '')}`,
            inline: true,
        },
        {
            name: `${ctx.emojis.nyx.mechanic} ${interaction.langFile.responses[`in-embed`][`powered-by`].title}`,
            value: `> [**${interaction.langFile.responses[`in-embed`][`powered-by`].advertisement}**](https://www.linode.com/lp/refer/?r=b5af259a0c96e896ed5142ea484721cbf1365ae5) ${interaction.langFile.responses[`in-embed`][`powered-by`].referral}\n> *[${interaction.langFile.responses[`in-embed`][`powered-by`][`read-more`]}](https://www.linode.com/referral-program/)*`
        }
    ]);

    const buttons = [];

    buttons.push(
        new ctx.libs.builder.MessageButton()
        .setLabel(interaction.langFile.responses.buttons.website)
        .setEmoji(`${ctx.emojis.nyx.sylhug}`)
        .setStyle(`Link`)
        .setURL(`https://nyx.bot/`)
    )

    buttons.push(
        new ctx.libs.builder.MessageButton()
        .setLabel(interaction.langFile.responses.buttons.invite)
        .setEmoji(`${ctx.emojis.nyx.happy}`)
        .setStyle(`Link`)
        .setURL(`https://nyx.bot/i`)
    )

    buttons.push(
        new ctx.libs.builder.MessageButton()
        .setLabel(interaction.langFile.responses.buttons.join)
        .setEmoji(`${ctx.emojis.nyx.pat}`)
        .setStyle(`Link`)
        .setURL(`https://nyx.bot/server`)
    )
    
    return interaction.reply({
        embeds: [embed.toJSON()],
        components: [new ctx.libs.builder.MessageActionRow().addComponents(...buttons)]
    })
}

module.exports = {
    func,
    //interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
    //    .setDescription(`This command shows you general information of Nyx!`)
    //    .setDefaultPermission(true)
}
const func = async (interaction) => {
    const embed = new ctx.libs.builder.Embed();
    embed.setTitle(`**Nyx's Stats**`)
    embed.setDescription(`**${ctx.utils.escape(interaction.guild.name)}** is on shard **#${interaction.guild.shard.id}**`);
    embed.setColor(ctx.utils.colors('random'))

    const stats = await require('../../../../util/stats').fetch()

    embed.addField({
        name: `${ctx.emojis.nyxWhite} Servers`,
        value: `${stats.serversOnThisShard} on this shard\n${stats.totalServers} across all shards`,
        inline: true,
    })
    
    embed.addField({
        name: `${ctx.emojis.nyxWhite} Users`,
        value: `${stats.membersOnThisShard} on this shard\n${stats.totalMembers} across all shards`,
        inline: true,
    })
    
    embed.addField({
        name: `:gear: Internal Events`,
        value: `${stats.eventsPerSecondOnThisShard}/s, ${stats.eventsPerHourOnThisShard}/h on this shard\n${stats.totalEventsPerSecond}/s, ${stats.totalEventsPerHour}/h across all shards`,
        inline: true,
    })
    
    embed.addField({
        name: `:musical_note: Music playing in`,
        value: `0 servers`,
        inline: true,
    })
    
    embed.addField({
        name: `${ctx.emojis.nyxWhite} Version`,
        value: `Nyx v${require('../../../../package.json').version}`,
        inline: true,
    })
    
    embed.addField({
        name: `${ctx.emojis.icons.nodejs} Discord.js version`,
        value: `v${require('../../../../package.json').dependencies['discord.js'].replace('^', '')}`,
        inline: true,
    })

    const buttons = [];

    buttons.push(
        new ctx.libs.builder.MessageButton()
        .setLabel(`Nyx's Website`)
        .setEmoji(`${ctx.emojis.nyx.sylhug}`)
        .setStyle(`LINK`)
        .setURL(`https://nyx.bot/`)
    )

    buttons.push(
        new ctx.libs.builder.MessageButton()
        .setLabel(`Invite Nyx to your server!`)
        .setEmoji(`${ctx.emojis.nyx.happy}`)
        .setStyle(`LINK`)
        .setURL(`https://nyx.bot/i`)
    )

    buttons.push(
        new ctx.libs.builder.MessageButton()
        .setLabel(`Join Nyx's Shrine!`)
        .setEmoji(`${ctx.emojis.nyx.pat}`)
        .setStyle(`LINK`)
        .setURL(`https://nyx.bot/server`)
    )
    
    return interaction.reply({
        embeds: [embed],
        components: [new ctx.libs.builder.MessageActionRow().addComponents(...buttons)]
    })
}

module.exports = {
    func,
    interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
        .setDescription(`This command shows you general information of Nyx!`)
        .setDefaultPermission(true)
}
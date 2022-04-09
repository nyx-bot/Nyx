const func = async interaction => {
    const embed = new ctx.libs.builder.Embed()
    .setTitle(`Server info for **${ctx.utils.escape(interaction.guild.name)}**`)
    .setThumbnail(interaction.guild.iconURL({ size: 2048, dynamic: true }))
    .setColor(ctx.utils.colors(`random`))

    if(interaction.guild.banner) embed.setImage(interaction.guild.bannerURL({ size: 2048, dynamic: true }));

    embed.setDescription(`Server created ${(await ctx.utils.time(Date.now() - interaction.guild.createdTimestamp)).string} ago.`)

    embed.addField({
        inline: true,
        name: `**Owner:**`,
        value: `<@${interaction.guild.ownerId}>`
    }); 
    
    let tierThresholds = [0, 2, 7, 14];
    console.log(Number(interaction.guild.premiumTier.split(`_`)[1] || 0))
    let nextTierThreshold = tierThresholds[(Number(interaction.guild.premiumTier.split(`_`)[1]) || 0)+1] ? `${interaction.guild.premiumSubscriptionCount}/${tierThresholds[(Number(interaction.guild.premiumTier.split(`_`)[1]) || 0)+1]} to tier ${(Number(interaction.guild.premiumTier.split(`_`)[1]) || 0)+1}` : `${interaction.guild.premiumSubscriptionCount}`
    embed.addField({
        inline: true,
        name: `**Server Tier:**`,
        value: `**Tier ${Number(interaction.guild.premiumTier.split(`_`)[1] || 0)}** (${nextTierThreshold})`
    }); 

    embed.addField({
        inline: true,
        name: `**Server ID:**`,
        value: `${interaction.guild.id}`
    });

    const bots = interaction.guild.members.cache.filter(a => a.user.bot ? true : false).length;
    const members = interaction.guild.memberCount-bots

    embed.addField({
        inline: true,
        name: `**Member Count:**`,
        value: `${members} member${members === 1 ? `` : `s`}`
    });

    embed.addField({
        inline: true,
        name: `**Bot Count:**`,
        value: `${bots} member${bots === 1 ? `` : `s`}`
    });

    embed.addField({
        inline: true,
        name: `**Total Member Count:**`,
        value: `${interaction.guild.memberCount} member${interaction.guild.memberCount === 1 ? `` : `s`}`
    });

    let mfalevel = `:unlock: Multi-Factor is **not** enforced.`;
    if(interaction.guild.mfaLevel.toLowerCase() == `elevated`) mfalevel = `:lock: Multi-Factor is enforced.`

    embed.addField({
        inline: true,
        name: `**Moderation Security:**`,
        value: mfalevel
    });

    embed.addField({
        inline: true,
        name: `**Content Filtering:**`,
        value: `${interaction.guild.explicitContentFilter === `DISABLED` ? `:unlock:` : `:lock:`} ${interaction.guild.explicitContentFilter.split(`_`).map(a => `${a[0].toUpperCase()}${a.slice(1).toLowerCase()}`).join(` `)}`
    });

    embed.addField({
        inline: true,
        name: `**Roles [${interaction.guild.roles.cache.size}]**`,
        value: `${interaction.guild.roles.cache.map(a => `<@&${a.id}>`).join(` `)}`
    })

    interaction.reply({
        embeds: [embed]
    })
}

module.exports = {
    func,
    interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
        .setDescription(`Gives the current information about this server.`)
        .setDefaultPermission(true)
}
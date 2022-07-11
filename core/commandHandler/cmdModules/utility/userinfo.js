const func = interaction => {
    const member = interaction.options.getMember(`user`, false) || interaction.member;

    const embed = new ctx.libs.builder.EmbedBuilder()
    .setTitle(`${ctx.utils.escape(member.user.username)}#${ctx.utils.escape(member.user.discriminator)}`)
    .setThumbnail(member.user.avatarURL({ size: 2048, dynamic: true }));

    const badges = [];
    if(member.user.bot) {
        embed.setColor(ctx.utils.colors('blurple')); badges.push(`${ctx.emojis.nyx.mechanic} Discord Bot`)
    } else {
        if(member.guild.ownerId == member.id) {embed.setColor(ctx.utils.colors('white')); badges.push(`${ctx.emojis.nyx.smirk} Server Owner`)};
        {embed.setColor(ctx.utils.colors('purple')); badges.push(`${ctx.emojis.nyx.love} NyxSupporter`)}
        if(ctx.config.elevated.find(u => u == member.user.id)) {embed.setColor(ctx.utils.colors('red_light')); badges.push(`${ctx.emojis.nyx.mechanic} Nyx Developer`)};
        if(member.permissions.has(`ADMINISTRATOR`)) {embed.setColor(ctx.utils.colors('green')); badges.push(`${ctx.emojis.nyx.tos} Server Administrator`)}
    }
    
    embed.setDescription(badges.join(`\n`))

    const accountAge = ctx.utils.time(Date.now() - Number(member.user.createdTimestamp)), accountAgeStr = [];
    for(key of Object.keys(accountAge.units)) if(key !== `ms` && key !== `infinite`) {
        const unit = accountAge.units[key];
        let k = key[0];
        if(key.startsWith(`mo`)) k = `mo`;
        if(key.startsWith(`min`)) k = `min`;
        if(unit !== 0) accountAgeStr.push(`${unit}${k}`)
    }; embed.addFields([
        {
            name: `Registered:`,
            value: `${accountAgeStr.length !== 1 ? accountAgeStr.slice(0, 3).slice(0, -1).join(`, `) + `, and ` + accountAgeStr.slice(0, 3).slice(-1) : accountAgeStr[0]} ago.`,
            inline: true
        }
    ]);

    const joinedServerAge = ctx.utils.time(Date.now() - Number(member.joinedTimestamp)), joinedServerAgeStr = [];
    for(key of Object.keys(joinedServerAge.units)) if(key !== `ms` && key !== `infinite`) {
        const unit = joinedServerAge.units[key];
        let k = key[0];
        if(key.startsWith(`mo`)) k = `mo`;
        if(key.startsWith(`min`)) k = `min`;
        if(unit !== 0) joinedServerAgeStr.push(`${unit}${k}`)
    }; embed.addFields([
        {
            name: `Joined Server:`,
            value: `${joinedServerAgeStr.length !== 1 ? joinedServerAgeStr.slice(0, 3).slice(0, -1).join(`, `) + `, and ` + joinedServerAgeStr.slice(0, 3).slice(-1) : joinedServerAge[0]} ago.`,
            inline: true
        }
    ]);

    embed.addFields([
        {
            name: `${member.roles.cache.size} Role${member.roles.cache.size === 1 ? `` : `s`}:`,
            value: `${member.roles.cache.map(r => r.toString()).join(` `)}`
        }
    ]);

    interaction.reply({
        content: `User Info of **${ctx.utils.escape(member.user.username)}**`,
        embeds: [embed.toJSON()]
    })
}

module.exports = {
    func,
    interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
        .setDescription(`Gives the current information about a specified user.`)
        .setDefaultPermission(true)
        .addUserOption(s => {
            s.setName(`user`)
            s.setDescription(`Person to retrieve information on`)
            s.setRequired(false);

            return s;
        })
}
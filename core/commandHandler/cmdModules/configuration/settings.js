const func = async (interaction) => {
    const guild = {
        prefix: await ctx.seq.util.lookupGuild(`prefix`, interaction.guild.id, true),
        logging: await ctx.seq.util.lookupGuild(`logging`, interaction.guild.id, true),
        reactionRoles: await ctx.seq.util.fetchReactionRoles(interaction.guild.id, true),
    }
    console.log(guild)
}

module.exports = {
    func,
    interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
        .setDescription(`View and change the settings for this server!`)
        .setDefaultPermission(true)
}
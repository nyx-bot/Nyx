const func = interaction => {
    if(ctx.music && ctx.music[interaction.guild.id]) return interaction.reply({
        ephemeral: true,
        content: `${ctx.emojis.nyx.fail} I can't do that while playing music in this server!`
    });

    
};

module.exports = {
    func,
    interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
        .setDescription(`play a bruh sound effect in your voice channel.`)
        .setDefaultPermission(true)
}
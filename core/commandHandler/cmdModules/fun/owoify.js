const func = (interaction) => {
    let content = interaction.options.getString(`message`)
    if(content) {
        length = [];

        if(content.length > 2000) {
            return interaction.reply({
                content: `${ctx.emojis.fail} I cannot send messages above the character limit of 2,000!`, 
                ephemeral: true
            })
        } else {
            length.push(content.length);
            content = ctx.utils.owoify(content);
            length.push(content.length);
            
            if(content.length > 2000) {
                return interaction.reply({
                    content: `${ctx.emojis.fail} The final result is above the character limit of 2,000! (${content.length})`, 
                    ephemeral: true
                })
            } else {
                interaction.reply({
                    ephemeral: true,
                    content: `${ctx.emojis.pass} Here you go!`,
                    embeds: [
                        new ctx.libs.builder.EmbedBuilder()
                            .setDescription(content)
                            .setColor(ctx.utils.colors(`random`))
                            .toJSON()
                    ]
                })
            }
        }
    }
};

module.exports = {
    func,
    interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
        .setDescription(`OwO-ifies what you say!`)
        .setDefaultPermission(true)
        .addStringOption(s => {
            s.setName(`message`);
            s.setDescription(`What would you like to owo-ify?`)
            s.setRequired(true);

            return s;
        })
}
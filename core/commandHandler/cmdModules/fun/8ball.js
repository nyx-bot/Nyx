const func = (interaction) => interaction.reply({
    content: interaction.langFile[Math.floor((Math.random() * interaction.langFile.length))]
});

module.exports = {
    func,
    interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
        .setDescription(`the most trustworthy system to ask a question.`)
        .setDefaultPermission(true)
        .addStringOption(s => {
            s.setName(`query`);
            s.setDescription(`What would you like to ask the "Most Trustworthy System?"`)
            s.setRequired(true);

            return s;
        })
}
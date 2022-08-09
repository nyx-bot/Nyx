const func = async interaction => {
    const gaymeter = ["5","5","5","10","10","15","15","20","20","20","20","25","25","35","35","35","35","35","35","35","35","35","40","45","50","55","60","65","69","70","75","80","85","90","95","100"]
    const userpinged = interaction.options.getUser(`user`)
    if(userpinged.bot && userpinged.id !== ctx.bot.user.id) return interaction.reply(`${ctx.emojis.nyx.confusion} ${interaction.langFile.responses.bot}`);
    const percentage = gaymeter[Math.floor((Math.random() * gaymeter.length))];
    return interaction.reply(interaction.langFile.responses.measure.replace(/%username%/g, ctx.utils.escape(userpinged.username)).replace(/%percentNumber%/g, percentage))
};

module.exports = {
    func,
    interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
        .setDescription(`see how gay someone is (trustworthy 100).`)
        .setDefaultPermission(true)
        .addUserOption(s => {
            s.setName(`user`);
            s.setRequired(true);
            s.setDescription(`the person you want to measure with your very very trustworthy and totally non-rng gaydar`)

            return s;
        })
}
const func = async interaction => {
    const gaymeter = ["5","5","5","10","10","15","15","20","20","20","20","25","25","35","35","35","35","35","35","35","35","35","40","45","50","55","60","65","69","70","75","80","85","90","95","100"]
    const userpinged = interaction.options.getUser(`user`)
    if(userpinged.bot && userpinged.id !== ctx.bot.user.id) return interaction.reply(`${ctx.emojis.nyx.confusion} I'm pretty sure most bots don't even know the definition of that...`);
    const percentage = gaymeter[Math.floor((Math.random() * gaymeter.length))];
    return interaction.reply(`**${ctx.utils.escape(userpinged.username)}** is ${percentage}% gay` + (Number(percentage) >= 80 ? `... ${ctx.emojis.nyx.smirk}` : ``))
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
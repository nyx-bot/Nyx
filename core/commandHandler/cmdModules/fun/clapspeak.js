const func = interaction => {
    var e1 = [`:muscle:`, `:punch:`, ``]
    let result1 = Math.floor((Math.random() * e1.length))
    var e2 = [`:weary:`, `:pensive:`, `:triumph:`, `:hot_face:`]
    let result2 = Math.floor((Math.random() * e2.length))
    var e3 = [`:ok_hand:`, `:ok_hand::ok_hand:`, `:sweat_drops:`, ``]
    let result3 = Math.floor((Math.random() * e3.length));

    var emoji1 = e1[result1];
    var emoji2 = e2[result2];
    var emoji3 = e3[result3];

    if((emoji1 == '') && (emoji3 == '')) {emoji2 = e2[result2] + e2[result2]}

    const content = (interaction.options.getString(`content`, false) || ``).toUpperCase().split(` `).join(" :clap: ")

    interaction.reply({content: content + ` ${emoji1}${emoji2}${emoji3}`})
};

module.exports = {
    func,
    interactionOptions: [
        {
            type: `string`,
            required: true,
        }
    ]
    //interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
    //    .setDescription(`Turn :clap: your :clap: message :clap: into :clap: this :clap: abomination`)
    //    .setDefaultPermission(true)
    //    .addStringOption(s => {
    //        s.setName(`content`);
    //        s.setRequired(true);
    //        s.setDescription(`the message you want to convert`)
//
    //        return s;
    //    })
}
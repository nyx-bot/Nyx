const responses = [
    `An internal error happened while doing that! Please try again later`,
    ``
]

module.exports = (interaction, message, err, ...content) => {
    if(`${err}`.toLowerCase().includes(`unknown interaction`)) return;
    if(content.filter(c => `${c}`.toLowerCase().includes(`unknown interaction`)).length > 0) return;

    const errorID = ctx.utils.idGen(16);

    const obj = {
        content: `${ctx.emojis.nyx.cry} ` + (typeof message == `string` && `${message}`.length > 10 ? `${message}` : responses[Math.floor((Math.random() * responses.length))]) + `\n\n- If this has happened multiple times now, or you think this isn't supposed to happen, please help us make Nyx better and report it!`,
        components: [new ctx.libs.builder.MessageActionRow().addComponents(
            new ctx.libs.builder.MessageButton()
            .setURL(`https://nyx.bot/server`)
            .setEmoji(`${ctx.emojis.nyx.happy}`)
            .setLabel(`Send us a message in the Nyx's Shrine Discord Server`)
            .setStyle(`Link`)
        )],
        ephemeral: true,
    };

    if(err || content.length !== 0) {
        obj.content = obj.content + ` [EID: ${errorID}]`
        console.errorWithEID(errorID, interaction, err === true ? message : err, ...content);
    };

    return obj;
}
module.exports = (msg, args, lang) => {
    if(!args[0]) {
        return msg.reply(`${ctx.emojis.nyx.confusion} ${lang.noResponse}`)
    } else msg.reply(lang.responses[Math.floor((Math.random() * lang.responses.length))]);
}
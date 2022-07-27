module.exports = {
    bot: `Creo que la mayoría de los bots no saben qué es eso...`,

    measure: (username, percentNumber) => `**${username}** es ${percentNumber}% gay ${(Number(percentNumber) >= 80 ? `... ${ctx.emojis.nyx.smirk}` : ``)}`
}
module.exports = {
    bot: `I'm pretty sure most bots don't even know the definition of that...`,

    measure: (username, percentNumber) => `**${username}** is ${percentNumber}% gay ${(Number(percentNumber) >= 80 ? `... ${ctx.emojis.nyx.smirk}` : ``)}`
}
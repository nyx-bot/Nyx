require(`./core/client/initialize`)().then(async () => {    
    ctx.bot.on(`ready`, () => {
        console.log(`bot marked as ready!`)
    });

    ctx.bot.on(`error`, e => {
        console.error(`${e}`)
    });

    ctx.bot.on(`interactionCreate`, i => {
        try {
            ctx.commandHandler(i)
        } catch(e) {
            i.reply({
                content: `${ctx.emoji.fail} There was an issue while trying to run this command. Please try again later!\n\nIf this continues to happen, please make sure to report this to the developers at **https://nyx.bot/server**!`,
                ephemeral: true,
            })
        }
    })

    ctx.bot.login();
})
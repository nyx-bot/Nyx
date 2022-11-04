require(`./core/initialize`)().then(async () => {    
    ctx.bot.on(`ready`, () => {
        console.log(`bot marked as ready!`)
    })

    ctx.bot.login();
})
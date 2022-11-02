require(`./core/initLogging`)()

global.ctx = require(`./core/initCtx`)();

ctx.bot = require(`./clientSettings`);

ctx.bot.on(`ready`, () => {
    console.log(`Cluster #${ctx.bot.cluster.id} is ready!`)
})

ctx.bot.login();
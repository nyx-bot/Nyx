module.exports = () => new Promise(async res => {
    require(`./initLogging`)();

    console.debug(`Logging created!`)

    global.ctx = require(`./createCtx`)();

    res()
})
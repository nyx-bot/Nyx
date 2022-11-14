module.exports = () => new Promise(async res => {
    require(`./initLogging`)();

    global.ctx = require(`./createCtx`)();

    res()
})
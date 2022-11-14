let bot = require(`../../../clientSettings`);

bot.on(`error`, e => {
    console.error(`Client error:`, e)
});

module.exports = bot;
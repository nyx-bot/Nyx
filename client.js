const Base = require('eris-sharder').Base;

require(`./core/initLogging`)()

let ctx = require(`./core/initCtx`)();

class Nyx extends Base {
    launch() {
        ctx.bot = this.bot;
        console.log(`Shard is logged in as ${ctx.bot.user.username}`)
    }
}

module.exports = Nyx
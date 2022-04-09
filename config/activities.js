// just place a bunch of activities here.

module.exports = {
    starting: [
        {
            name: `with nothing, i'm still loading lol / nyx.bot`,
            type: `PLAYING`
        },
        {
            name: `a bunch of errors in the console / nyx.bot`,
            type: `LISTENING`
        },
        {
            name: `my servers catch fire / nyx.bot`,
            type: `WATCHING`
        },
    ],

    getActive: () => new Promise(async res => res([
        {
            name: `/help | nyx.bot`,
            type: `LISTENING`
        },
        {
            name: `music to ${typeof ctx == `object` && ctx.music && typeof ctx.music.size == `number` ? ctx.music.size : `your`} voice channel${typeof ctx == `object` && ctx.music && typeof ctx.music.size == `number` && ctx.music.size === `` ? `` : `s`}! | nyx.bot`,
            type: `STREAMING`
        },
        {
            name: `${(await ctx.bot.shard.fetchClientValues(`guilds.cache.size`)).reduce((prev, val) => prev + val, 0)} servers! | nyx.bot`,
            type: `WATCHING`
        },
    ]))
}
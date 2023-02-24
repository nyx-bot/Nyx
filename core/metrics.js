module.exports = (ctx) => {
    return {
        "[BOT] Cached Guilds": ctx.bot.guilds.size,
        "[BOT] Cached Users": ctx.bot.guilds.reduce((a, b) => a + b.memberCount, 0),
        "[BOT] Commands since Last Restart": ctx.commandsRan || 0,
        "[MUSIC] Sessions": Object.keys(ctx.music).filter(a => !isNaN(a)).length,
        "[MUSIC] Pending Confirmation": Object.keys(ctx.music).filter(a => isNaN(a)).length,
        "[MUSIC] Total Songs Queued": Object.values(ctx.music).filter(o => o.queue && typeof o.queue.length == `number`).map(o => o.queue.length).reduce((a,b) => a + b, 0),
        "[SYSTEM] Events per Second": ctx.eventCountWithinASecond,
        "[SYSTEM] Events per Minute": ctx.eventCountWithinAMinute,
        "[SYSTEM] Events per Hour": ctx.eventCountWithinAnHour
    }
}
module.exports = {
    fetch: () => new Promise(async res => {
        const guildValues = await ctx.bot.shard.fetchClientValues(`guilds.cache.size`);
        const memberValues = await ctx.bot.shard.broadcastEval(() => ctx.bot.guilds.cache.map(require(`${require.main.filename.split('/').slice(0, -1).join('/')}/util/stats`).memberCacheMap).reduce((prev, val) => prev + val, 0));

        const eventValues = await ctx.bot.shard.broadcastEval(() => {
            const obj = {
                perSecond: Number(global.ctx.eventCount.eventCountWithinASecond),
                perMinute: Number(global.ctx.eventCount.eventCountWithinAMinute),
                perHour: Number(global.ctx.eventCount.eventCountWithinAnHour),
            };
            return obj
        })

        res({
            totalServers: guildValues.reduce((prev, val) => prev + val, 0),
            totalMembers: memberValues.reduce((prev, val) => prev + val, 0),
            totalEventsPerSecond: eventValues.map(v => v.perSecond).reduce((prev, val) => prev + val, 0),
            totalEventsPerMinute: eventValues.map(v => v.perMinute).reduce((prev, val) => prev + val, 0),
            totalEventsPerHour: eventValues.map(v => v.perHour).reduce((prev, val) => prev + val, 0),

            serversOnThisShard: ctx.bot.guilds.cache.size,
            membersOnThisShard: ctx.bot.guilds.cache.map(require(`${require.main.filename.split('/').slice(0, -1).join('/')}/util/stats`).memberCacheMap).reduce((prev, val) => prev + val, 0),
            eventsPerSecondOnThisShard: global.ctx.eventCount.eventCountWithinASecond,
            eventsPerMinuteOnThisShard: global.ctx.eventCount.eventCountWithinAMinute,
            eventsPerHourOnThisShard: global.ctx.eventCount.eventCountWithinAnHour,
        })
    }),

    memberCacheMap: g => {
        let val = 0;
        if(g.memberCount && g.members.cache) {
            val = Number(g.memberCount > g.members.cache.size ? g.memberCount : g.members.cache.size)
        } else if(!g.memberCount && g.members.cache) {
            val = Number(g.members.cache.size)
        } else if(g.memberCount && !g.members.cache) {
            val = Number(g.memberCount)
        } else {
            val = 0
        }; return val
    }
}
module.exports = async (ctx) => {
     console.l(`┃ THE DAILY MAINTENANCE TIMER WILL BEGIN IN 30 SECONDS.`);
     await ctx.timeout(10000)
     console.l(`┃ THE DAILY MAINTENANCE TIMER WILL BEGIN IN 20 SECONDS.`);
     await ctx.timeout(10000)
     console.l(`┃ THE DAILY MAINTENANCE TIMER WILL BEGIN IN 10 SECONDS.`);
     await ctx.timeout(5000)
     console.l(`┃ THE DAILY MAINTENANCE TIMER WILL BEGIN IN 5 SECONDS.`);
     await ctx.timeout(5000)
     console.l(`┃ DAILY MAINTENANCE IS NOW RUNNING.`);
     await core.leaveBotCollectionServers(ctx)
     console.l(`┃ DAILY MAINTENANCE HAS COMPLETED ITS RUN!`);
}
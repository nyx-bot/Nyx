module.exports = (ctx) => new Promise(async res => {
     console.debugLog(`DETECTING BOT COLLECTION SERVERS`)
     let foundCollection = 0;
     let guilds = Array.from(ctx.bot.guilds).map(g => g[1]).filter(g => g.id && ((ctx.config.botDetectionWhitelist && ctx.config.botDetectionWhitelist.find(i => i == g.id)) ? false : true) && g.members && g.members.size >= 22);
     console.debugLog(`${guilds.length}/${ctx.bot.guilds.size} SERVERS TO TESTIFY (ABOVE 20 MEMBERS${ctx.config.botDetectionWhitelist && ctx.config.botDetectionWhitelist.length !== 0 ? `, ${ctx.config.botDetectionWhitelist.length} TO SKIP` : ``})`)
     for(const g of guilds) {
          console.debugLog(`TESTING SERVER ${g.id} / ${g.name}`);
          const r = await ctx.core.checkServerIfBotCollection(ctx, g);
          if(r.result) {
               foundCollection++
               console.debugLog(`SERVER ${g.id} IS A BOT COLLECTION! (${r.botCount}/${r.totalMemberCount} members are bots! this is about ${r.percentage}% of the server's population)`)
               await ctx.bot.leaveGuild(g.id);
               console.debugLog(`SUCCESSFULLY LEFT ${g.id}!`)
          } else {
               console.debugLog(`SERVER ${g.id} IS NOT A BOT COLLECTION! (${r.botCount}/${r.totalMemberCount} members are bots! this is about ${r.percentage}% of the server's population)`)
          }
     };
     console.debugLog(`SUCCESSFULLY FINISHED DETECTIONS, ${foundCollection}/${guilds.length} SERVERS DETECTED.`);
     res(foundCollection)
})
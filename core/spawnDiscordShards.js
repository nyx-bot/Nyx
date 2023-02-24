module.exports = ctx => new Promise(async (res, rej) => {
     console.d(`Session IDs pending; applying them.`); done = 0;

     for(i of ctx.pendingShardIDs) {
          ctx.bot.shards.spawn(i[0]);
          ctx.bot.shards.get(i[0]).sessionID = i[1];
          console.d(`Session ID of shard ${i[0]} is now set to ${ctx.bot.shards.get(i[0]).sessionID.substring(0, 15)}...`);
          await new Promise(res => {ctx.bot.shards.get(i[0]).once(`shardPreReady`, res); ctx.timeout(20000).then(res)}); done++
     }; res(done)
})
module.exports = async (ctx) => {
     let fixed = false, checked = 0
     while(!fixed && checked < 5) {
          await ctx.timeout(500)
          ctx.bot.shards.forEach(shard => {
               if(shard.status != `ready`) {fixed = true; checked = 0; return shard.emit('disconnect')}
          });
     };
     fixed = false, checked = 0;
}
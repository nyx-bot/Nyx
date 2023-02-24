module.exports = ctx => new Promise(async (res, rej) => {

     /* status codes: 
          0 - all is working well
          1 - the shard is disconnected
          2 - nyx is logging in
          3 - connected to discord, not ready
     */

     ctx.bot.on('shardPreReady', id => {
          ctx.connectionErrHandling[`shard${id}`].code = 3;
          console.d(`shardPreReady on ID ${id}`)
     })
     ctx.bot.shards.forEach(shard => {
          ctx.connectionErrHandling[`shard${shard.id}`] = {
               code: 0
          }
          let pass = false;
          shard.on('disconnect', async () => {
               await ctx.timeout(10000);

               while(shard.status !== `ready`) {
                    if(!ctx.ignoreAllMessages) {
                         if(shard.status == `disconnected`) {
                              try {
                                   await shard.connect();
                              } catch(e) {}
                         }
                    };

                    await ctx.timeout(10000);
               }
               
               if( /*!ctx.ignoreAllMessages*/ false ) { // add false here; considering nyx's downtime can't be worse, we should give eris's own shard handling a proper shot
                    pass = true;
                    console.l(`[!] SHARD ${shard.id} HAS DISCONNECTED.`);
                    ctx.connectionErrHandling[`shard${shard.id}`].code = 1
                    let checking;
                    let status;
                    while(shard.status != `ready` && pass) {
                         ctx.connectionErrHandling[`shard${shard.id}`].code = 1
                         if(shard.status !== status) {status = shard.status; console.l(`[i] SHARD ${shard.id} STATUS: ${status}`)}
                         if(shard.status == `disconnected` && checking != shard.status) {
                              checking = shard.status;
                              await ctx.timeout(10000);
                              if(shard.status == `disconnected` && shard.status == checking) {
                                   ctx.connectionErrHandling[`shard${shard.id}`].code = 2
                                   console.l(`[!] SHARD STATUS HAS REMAINED "DISCONNECTED" FOR 10 SECONDS; RECONNECTING MANUALLY`);
                                   //shard.disconnect();
                                   //await ctx.timeout(2000)
                                   checking = null;
                                   try {
                                        shard.connect();
                                   } catch(e) {
                                        console.de(`Failed to reconnect shard: ${e}`)
                                   }
                              }
                         } else if(shard.status == `connecting` && checking != shard.status) {
                              checking = shard.status;
                              await ctx.timeout(30000);
                              if(shard.status == `connecting` && shard.status == checking) {
                                   ctx.connectionErrHandling[`shard${shard.id}`].code = 2
                                   console.l(`[!] SHARD STATUS HAS REMAINED "CONNECTING" FOR 30 SECONDS; RECONNECTING MANUALLY`);
                                   //shard.disconnect();
                                   //await ctx.timeout(2000)
                                   checking = null;
                                   try {
                                        shard.connect();
                                   } catch(e) {
                                        console.de(`Failed to reconnect shard: ${e}`)
                                   }
                              }
                         } else if(shard.status == `handshaking` && checking != shard.status) {
                              checking = shard.status;
                              await ctx.timeout(15000);
                              if(shard.status == `handshaking` && shard.status == checking) {
                                   ctx.connectionErrHandling[`shard${shard.id}`].code = 2
                                   console.l(`[!] SHARD STATUS HAS REMAINED "HANDSHAKING" FOR 15 SECONDS; RECONNECTING MANUALLY`);
                                   //shard.disconnect();
                                   //await ctx.timeout(2000)
                                   checking = null;
                                   try {
                                        shard.connect();
                                   } catch(e) {
                                        console.de(`Failed to reconnect shard: ${e}`)
                                   }
                              }
                         } else if(shard.status == `resuming` && checking != shard.status) {
                              checking = shard.status;
                              await ctx.timeout(30000);
                              if(shard.status == `resuming` && shard.status == checking) {
                                   ctx.connectionErrHandling[`shard${shard.id}`].code = 2
                                   console.l(`[!] SHARD STATUS HAS REMAINED "RESUMING" FOR 30 SECONDS; RECONNECTING MANUALLY`);
                                   //shard.disconnect();
                                   //await ctx.timeout(2000)
                                   checking = null;
                                   try {
                                        shard.connect();
                                   } catch(e) {
                                        console.de(`Failed to reconnect shard: ${e}`)
                                   }
                              }
                         }
                         await ctx.timeout(10000)
                    }
               }
          });
          shard.on('ready', () => {
               console.l(`[i] SHARD ${shard.id} HAS RECOVERED. [ready]`)
               ctx.connectionErrHandling[`shard${shard.id}`].code = 0
               pass = false;
               ctx.shardConnectedTime[`${shard.id}`] = Date.now()
          })
          shard.on('resume', () => {
               console.l(`[i] SHARD ${shard.id} HAS RECOVERED. [resume]`)
               ctx.connectionErrHandling[`shard${shard.id}`].code = 0
               pass = false;
               ctx.shardConnectedTime[`${shard.id}`] = Date.now()
          });
     })
     res()
})
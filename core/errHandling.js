module.exports = async (ctx, type, err) => { console.error(`${err}`)
     if(`${err}`.toLowerCase().includes(`status code`) && `${err}`.toLowerCase().includes(`429`)) {
          // youtube has blocked nyx once again.
          if(ctx.config.keys.youtubeCookie) {
               console.log(`-----------------------------------------------\n\nYOUTUBE 429 ERROR. YIKES.\nyoutube cookie IS recognized, so if not an actual cookie, delete the key in the config.json.\n\n-----------------------------------------------`)
          } else {
               console.log(`-----------------------------------------------\n\nYOUTUBE 429 ERROR. YIKES.\nthe youtube cookie has not been set in the config.json file; to add one, check "config.example.json" or under "keys" in config.json, add "youtubeCookie" and paste the cookie used in request headers.\n\n-----------------------------------------------`)
          }
     } else {
          if(!err) return
          if(`${err}`.includes(` 10.`)) return;
          let stack = [];
          if(err && err.stack) stack = err.stack.split('\n').slice(1).filter(l => l.includes(`/nyx/`));
          console.de(`${type} | ${err}\n` + `${stack.join(`\n`) || `[ NO STACK ]`}`)
          if(
               `${err}` == `Error: No content, file, or embed` || 
               `${err}`.includes('Cannot read property \'id\' of undefined')
          ) {} else if(`${err}`.toLowerCase().includes(`connection reset`) || (err.code == 1006)) {
               core.shardDowntimeCheck(ctx)
          } else if((err.code == `ETIMEDOUT` || err.code == `ECONNRESET` || stack && stack[0] && stack[0].includes('Shard.') && !stack[0].includes(`onWSClose`)) && !`${err}`.toLowerCase().includes(`cannot read property`)) {
               let msg = `┃ A CONNECTION HAS ERRORED (${err.code})`;
               const wantedObjects = [`address`, `path`, `syscall`]
               const o = Object.entries(err);
               o.forEach(ent => {
                    if(wantedObjects.find(a => `${ent[0]}`.includes(a))) {msg = msg + `\n┃ > ${ent[0].toString().toUpperCase()}: ${ent[1]}`}
               });
               if(msg.split('\n').length === 1) {console.e(stack || `no stack`, msg, err)} else {console.e(stack || `no stack`, msg)}
               core.shardDowntimeCheck(ctx)
               ctx.connectionErrors++; setTimeout(() => ctx.connectionErrors--, 660000);
               if(ctx.connectionErrors >= 10 && ctx.bot.shards.filter(s => s.status !== `ready`).length !== 0) {console.e(`┃ THERE HAVE BEEN 10 CONNECTION ERRORS WITHIN THE LAST 10 MINS; QUITTING...`); return core.exit(ctx, `Too many connection errors within the past 10 minutes.`)}
          } else if((err.code && typeof err.code == `string` && err.code.toLowerCase().includes(`discord`)) && type != `handledpromise`) {} else {
               if(err.stack) {
                    console.de(`${err}\n${err.stack}`)
               } else {
                    console.de(`${err}\n${err.stack}`)
               }
          }
     }
}
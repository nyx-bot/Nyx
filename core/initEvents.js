const fs = require('fs')

module.exports = async function (ctx) {
     return new Promise(async (res, rej) => {
          let eventsMade = 0;
          const Eris = require('oceanic.js')
          let origsize = ctx.events.size;
          if(origsize > 0) {
               const a = Array.from(ctx.events);
               for(i in a) ctx.bot.removeAllListeners([a[i][1].event])
               ctx.events = new Eris.Collection();
          }
          let createEvent = function (e, file) {
               eventsMade++;
               console.debugLog(e.event)
               if(e.event == "timer") {
                    if(!e.interval) {
                         core.boxLog(
                              `No interval for event: ${e.name}, not setting up interval.`
                         );
                         return;
                    }
                    ctx.events.get(e.event).timer = setInterval(
                         e.func,
                         e.interval,
                         ctx
                    );
               } else {
                    if(e.bypass) {
                         ctx.bot.on(e.event, async (...args) => e.func(...args, ctx));
                    } else {
                         let nameA = `${file.replace(".js", "")}`
                         let name = nameA.toLowerCase().charAt(0).toUpperCase() + nameA.toLowerCase().slice(1);
                         if(name[name.length-1] == 's') {
                             name = name.substring(0, name.length-1)
                         };
                         let obj = {
                              name: `${name} Logs`,
                              icon: require('../res/webhookUrls.json')[`logging${file.replace(".js", "")}`]
                         }
                         if(e.funcs && typeof e.funcs == `object`) {
                              e.funcs.forEach((func, i) => {
                                   console.log(`added ${e.event} function #${i+1}`)
                                   ctx.bot.on(e.event, async (...args) => {return func(...args, ctx, file.replace(".js", ""), obj)});
                              })
                         } else {
                              console.log(`added ${e.event} function`)
                              ctx.bot.on(e.event, async (...args) => {return e.func(...args, ctx, file.replace(".js", ""), obj)});
                         }
                    }
               }
          };

          let dirname = __dirname.split(`/`).slice(0, -1).join(`/`)
     
          var files = fs.readdirSync(dirname + "/events");
          for (let f of files) {
               let e = require(dirname + "/events/" + f);
               if(e.event && (e.func || e.funcs)) {
                    e.type = f.replace(".js", "");
                    ctx.events.set(e.event, e);
                    createEvent(e, f);
               } else if(e.length) {
                    for (let i = 0; i < e.length; i++) {
                         let a = e[i];
                         a.type = f.replace(".js", "");
                         if(a.event && (a.func || a.funcs)) {
                              ctx.events.set(a.event, a);
                              createEvent(a, f);
                         }
                    }
               }
          };

          ctx.bot.on('guildCreate', async (guild) => {
               console.l(`┃ Guild joined: [${guild.name}], now in a total of ${ctx.bot.guilds.size}`);
               ctx.utils.lookupGuild(ctx, guild.id);
               const r = await ctx.core.checkServerIfBotCollection(ctx, guild);
               if(r.result) {console.l(`${guild.name} IS A BOT COLLECTION SERVER; LEAVING!`); guild.leave()}
          })
          ctx.bot.on('guildDelete', async (guild) => {
               console.l(`┃ Guild left: [${guild.name}], now in a total of ${ctx.bot.guilds.size}`)
          });
          
          return res(eventsMade)
     })
}
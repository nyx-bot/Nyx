module.exports = async (ctx) => {
     ctx.lastMessageTimeoutThing = {lastUpdated: Date.now(), timeout: (setTimeout(() => {console.e(`┃ NO ACTIVITY HAS BEEN SEEN RECENTLY; RESTARTING...`); ctx.core.exit(ctx, `No activity; possible lost connection.`)}, 360000))};
     const events = Object.keys(ctx.bot._events);
     let listeners = 0;
     for (i in events) {
          listeners++
          const ev = events[i];
          ctx.bot.on(ev, () => {
               clearTimeout(ctx.lastMessageTimeoutThing.timeout);
               ctx.lastMessageTimeoutThing = {lastUpdated: Date.now(), timeout: (setTimeout(() => {console.e(`┃ NO ACTIVITY HAS BEEN SEEN RECENTLY; RESTARTING...`); ctx.core.exit(ctx, `No activity; possible lost connection.`)}, 360000))};
          })
     }; return listeners
}
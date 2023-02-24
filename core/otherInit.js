const fs = require('fs')

let logCount = 0;

function log() {
     const events = Object.keys(core.lastEvents);
     if(events.length !== 0) {
          console.debugLog(`[RECENT EVENTS]: ${events.map(b => `${b}: ${core.lastEvents[b]}`).join(', ')}`);
          core.lastEvents = {};
          logCount++;
          if(5 === logCount) {
               console.d(`[EVENT COUNTS]:\n${Object.entries(core.stats.s).map(s => `${s[0].toUpperCase()}: ${s[1]}`).join(', ')}`)
               logCount = 0
          }
     };
};

module.exports = async function (ctx) {
     ctx.core.createMetricsLoop(ctx)

     setInterval(log, 2000);
     if(!fs.existsSync(`./stats/`)) {fs.mkdirSync(`./stats/`)}
     if(!fs.existsSync(`./stats/statCache.json`) || !fs.readFileSync(`./stats/statCache.json`).toString().endsWith('}')) {fs.writeFileSync(`./stats/statCache.json`, `{}`)}
     if(!fs.existsSync(`./stats/eventsMinute.json`) || !fs.readFileSync(`./stats/eventsMinute.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/eventsMinute.json`, `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`)}
     if(!fs.existsSync(`./stats/serversMinute.json`) || !fs.readFileSync(`./stats/serversMinute.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/serversMinute.json`, `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`)}
     if(!fs.existsSync(`./stats/eventsHourly.json`) || !fs.readFileSync(`./stats/eventsHourly.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/eventsHourly.json`, `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`)}
     if(!fs.existsSync(`./stats/serversHourly.json`) || !fs.readFileSync(`./stats/serversHourly.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/serversHourly.json`, `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`)}
     if(!fs.existsSync(`./stats/eventsDaily.json`) || !fs.readFileSync(`./stats/eventsDaily.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/eventsDaily.json`, `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`)}
     if(!fs.existsSync(`./stats/serversDaily.json`) || !fs.readFileSync(`./stats/serversDaily.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/serversDaily.json`, `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`)}
     if(!fs.existsSync(`./stats/eventsMonthly.json`) || !fs.readFileSync(`./stats/eventsMonthly.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/eventsMonthly.json`, `[0,0,0,0,0,0,0,0,0,0,0,0]`)}
     if(!fs.existsSync(`./stats/serversMonthly.json`) || !fs.readFileSync(`./stats/serversMonthly.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/serversMonthly.json`, `[0,0,0,0,0,0,0,0,0,0,0,0]`)}
     const ae = JSON.parse(fs.readFileSync(`./stats/statCache.json`).toString());
     Object.keys(core.stats.s).forEach(k => {
          if(!isNaN(ae[k]) && core.stats.s[k]) {
               console.d(`SET ${k.toUpperCase()} TO ${ae[k]}`)
               core.stats.s[k] = ae[k]
          } else {
               console.d(`NO CACHE FOR ${k.toUpperCase()}, REMAINS AT ${core.stats.s[k]}`)
          }
     })
     await ctx.bot.editStatus(`online`, [{name: `/help / ;help`, type: 3}]);
     ctx.timer.start()
     ctx.timer2.start()
     Object.keys(ctx.statsTimers).forEach(timer => {
          ctx.statsTimers[timer].start()
          console.d(`STARTED TIMER: ${timer.toUpperCase()}`)
     })
     if(ctx.sendInterval) {clearInterval(ctx.sendInterval)}
}
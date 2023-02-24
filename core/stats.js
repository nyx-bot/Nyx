const fs = require('fs')

module.exports = {
    "s": {
        "min": 0,
        "hour": 0,
        "day": 0,
        "month": 0
    },
    saveCache: async (ctx) => fs.writeFileSync(`./stats/statCache.json`, JSON.stringify(core.stats.s)),
    minute: async (ctx) => {
          // EVENTS
          // this saves stuff from every minute, goes up to 60 mins.
          console.d(`Saving latest statistics... [MINUTE]`)
          if(!fs.existsSync(`./stats/`)) {fs.mkdirSync(`./stats/`)}
          if(!fs.existsSync(`./stats/eventsMinute.json`) || !fs.readFileSync(`./stats/eventsMinute.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/eventsMinute.json`, `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`)}
          let array = JSON.parse(fs.readFileSync(`./stats/eventsMinute.json`).toString());
          array.push([ctx.libs.moment.utc(Date.now() - 40000).format('h:mmA [UTC]'), core.stats.s.min]);
          if(array.length > 60 /* 60 is the number of minutes within an hour i think lol */) array.shift();
          fs.writeFileSync(`./stats/eventsMinute.json`, JSON.stringify(array))
          core.stats.s.min = 0;

          // SAVING SERVER COUNT WEEEEEEEEEE
          if(!fs.existsSync(`./stats/serversMinute.json`) || !fs.readFileSync(`./stats/serversMinute.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/serversMinute.json`, `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`)}
          let array2 = JSON.parse(fs.readFileSync(`./stats/serversMinute.json`).toString());
          array2.push([ctx.libs.moment.utc(Date.now() - 40000).format('h:mmA [UTC]'), ctx.bot.guilds.size]);
          if(array2.length > 60 /* 60 is the number of minutes within an hour i think lol */) array2.shift();
          fs.writeFileSync(`./stats/serversMinute.json`, JSON.stringify(array2))
          console.d(`Successfully saved the latest statistics!`);
     },
    hour: async (ctx) => {
          // EVENTS
          // this saves stuff from every hour, goes up to 24 hours.
          console.d(`Saving latest statistics... [HOUR]`)
          if(!fs.existsSync(`./stats/`)) {fs.mkdirSync(`./stats/`)}
          if(!fs.existsSync(`./stats/eventsHourly.json`) || !fs.readFileSync(`./stats/eventsHourly.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/eventsHourly.json`, `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`)}
          let array = JSON.parse(fs.readFileSync(`./stats/eventsHourly.json`).toString());
          array.push([ctx.libs.moment.utc(Date.now() - 300000).format('hA [UTC]'), core.stats.s.hour]);
          if(array.length > 24 /* 24 is the number of hours within a day i think lol */) array.shift();
          fs.writeFileSync(`./stats/eventsHourly.json`, JSON.stringify(array))
          core.stats.s.hour = 0;

          // SAVING SERVER COUNT WEEEEEEEEEE
          if(!fs.existsSync(`./stats/serversHourly.json`) || !fs.readFileSync(`./stats/serversHourly.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/serversHourly.json`, `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`)}
          let array2 = JSON.parse(fs.readFileSync(`./stats/serversHourly.json`).toString());
          array2.push([ctx.libs.moment.utc(Date.now() - 300000).format('hA [UTC]'), ctx.bot.guilds.size]);
          if(array2.length > 24 /* 24 is the number of hours within a day i think lol */) array2.shift();
          fs.writeFileSync(`./stats/serversHourly.json`, JSON.stringify(array2))
          console.d(`Successfully saved the latest statistics!`);
     },
    day: async (ctx) => {
          // EVENTS
          // this saves stuff from every day, goes up to 30 days.
          console.d(`Saving latest statistics... [DAY]`)
          if(!fs.existsSync(`./stats/`)) {fs.mkdirSync(`./stats/`)}
          if(!fs.existsSync(`./stats/eventsDaily.json`) || !fs.readFileSync(`./stats/eventsDaily.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/eventsDaily.json`, `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`)}
          let array = JSON.parse(fs.readFileSync(`./stats/eventsDaily.json`).toString());
          array.push([ctx.libs.moment.utc(Date.now() - 1.296e+8).format('MMM Do'), core.stats.s.day]);
          if(array.length > 30 /* 30 is around the number of days within a month i think lol */) array.shift();
          fs.writeFileSync(`./stats/eventsDaily.json`, JSON.stringify(array))
          core.stats.s.day = 0;

          // SAVING SERVER COUNT WEEEEEEEEEE
          if(!fs.existsSync(`./stats/serversDaily.json`) || !fs.readFileSync(`./stats/serversDaily.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/serversDaily.json`, `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`)}
          let array2 = JSON.parse(fs.readFileSync(`./stats/serversDaily.json`).toString());
          array2.push([ctx.libs.moment.utc(Date.now() - 1.296e+8).format('MMM Do'), ctx.bot.guilds.size]);
          if(array2.length > 30 /* 30 is around the number of days within a month i think lol */) array2.shift();
          fs.writeFileSync(`./stats/serversDaily.json`, JSON.stringify(array2))
          console.d(`Successfully saved the latest statistics!`);
     },
    month: async (ctx) => {
          // EVENTS
          // this saves stuff from every month, goes up to 12 months.
          console.d(`Saving latest statistics... [MONTH]`)
          if(!fs.existsSync(`./stats/`)) {fs.mkdirSync(`./stats/`)}
          if(!fs.existsSync(`./stats/eventsMonthly.json`) || !fs.readFileSync(`./stats/eventsMonthly.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/eventsMonthly.json`, `[0,0,0,0,0,0,0,0,0,0,0,0]`)}
          let array = JSON.parse(fs.readFileSync(`./stats/eventsMonthly.json`).toString());
          array.push([ctx.libs.moment.utc(Date.now() - 172800000).format('MMMM'), core.stats.s.month]);
          if(array.length > 12 /* 12 is the number of months within a year i think lol */) array.shift();
          fs.writeFileSync(`./stats/eventsMonthly.json`, JSON.stringify(array))
          core.stats.s.month = 0;

          // SAVING SERVER COUNT WEEEEEEEEEE
          if(!fs.existsSync(`./stats/serversMonthly.json`) || !fs.readFileSync(`./stats/serversMonthly.json`).toString().endsWith(`]`)) {fs.writeFileSync(`./stats/serversMonthly.json`, `[0,0,0,0,0,0,0,0,0,0,0,0]`)}
          let array2 = JSON.parse(fs.readFileSync(`./stats/serversMonthly.json`).toString());
          array2.push([ctx.libs.moment.utc(Date.now() - 172800000).format('MMMM'), ctx.bot.guilds.size]);
          if(array2.length > 12 /* 12 is the number of months within a year i think lol */) array2.shift();
          fs.writeFileSync(`./stats/serversMonthly.json`, JSON.stringify(array2))
          console.d(`Successfully saved the latest statistics!`);
     }
}
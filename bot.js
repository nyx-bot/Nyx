const Oceanic = require("oceanic.js");
const { EventEmitter } = require('events')
const logger = require('./log.js')
const startArgs = process.argv.slice(2);
const processStarted = Date.now();

global.ctx = {started: processStarted};

ctx.bot = require('./wrapperSettings.js').client;
ctx.rest = require('./wrapperSettings.js').rest;

const readyEmitter = new EventEmitter();

ctx.readyPromise = new Promise(res => {
     readyEmitter.once(`ready`, () => {
          console.d(`readyPromise: BOT MARKED AS READY, RESOLVING PROMISE AND REPLACING PROPERTY WITH NULL!`)
          ctx.readyPromise = null;
          res();
     })
})

ctx.bot.on("interactionCreate", int => require(`./core/earlyInteractionHandler`)(ctx, int))

ctx.forkedFromSpawner = typeof process.send == `function` ? true : false;
if(ctx.forkedFromSpawner) {
     logger(ctx);
     process.on(`message`, async m => {
          if(typeof m == `object`) {
               if(m.shards) {
                    console.d(`Recieved Shards from previous Client.`)
                    ctx.pendingShardIDs = m.shards;
               }
          } else if(m == `exit`) {
               ctx.core.exit()
          }
     }); 
} else {
     logger.classic(ctx)
     console.w(`STARTING NYX IN CLASSIC MODE.\nClassic mode is not maintained any further, and is advised against.\nTo avoid this error, start nyx using "index.js" instead of "bot.js."${ctx.debug ? `\n\nDebug mode is enabled by argument; this argument also works by starting Nyx with the officially supported method.` : ``}`)
}
ctx.debug = ctx.forkedFromSpawner || startArgs.find(a => a.includes('debug')) ? true : false;
ctx.bot.on(`debug`, debug => console.d(`OCEANIC DEBUG EVENT:`, debug))
const config = require("./config.json");
const core = require("./system/initCore")(ctx);
global.core = core;
let noDiscordConnectionTimeout = setTimeout(() => {
     console.l(`[!] A DISCORD CONNECTION WAS NOT ESTABLISHED WITHIN 30 SECONDS; QUITTING`)
     process.exit(1)
}, 30000);

function refreshTimeout(str, timer) {
     clearTimeout(noDiscordConnectionTimeout);

     noDiscordConnectionTimeout = setTimeout(() => {
          console.l(str || `[!] A DISCORD CONNECTION WAS NOT ESTABLISHED WITHIN 30 SECONDS; QUITTING`)
          process.exit(1)
     }, timer || 30000);
}

core.fancyLogBullshit();
const { commandHandler, interactionHandler, errHandling } = core;
const fs = require("fs");
const superagent = require("superagent");
const {getAudioDurationInSeconds} = require("get-audio-duration");
const moment = require("moment");
let cmdsMade, eventsMade, timeoutEventBullshit

// ===============================================
let ready = false;
let reconnection = null;
// ===============================================

ctx.timeout = (ms) => new Promise(r => setTimeout(r, ms))
ctx.connectionErrHandling = {};
ctx.shardConnectedTime = {};
ctx.reportErrTxt = `- If this has occurred many times now, please make sure to report this to **Nyx's Shrine!** You can find the server via the \`help\` command!`;
ctx.errMsgs = [
     `Something bad happened,, please try again in a minute or two!!`,
     `Uh oh,,, I think I messed up something,, please try again in a minute or two!`,
     `Something is not right,,,mmmm... try again in a bit,,?`,
     `*uhmm,,, wait uhh,,, nono yeah this is an error. mhm, yup, this is a problem. ehhhh... try again in a bit?*`,
     `at this point I should probably be expecting these problems — try again in a minute !!`,
     `+1 on the error counter! try again later,,,please,,`,
     `♪ 51 problems to patch on the wall, 51 problems to patch! Take one down, patch it around, 374 problems to patch on the wall! ♪ (an unknown problem occurred, try again in a minute!)`,
     `,,,oops.. something messed up,! can you try again for me in a bit,,?`
]
ctx.errMsg = (content) => `${ctx.errMsgs[Math.floor(Math.random() * ctx.errMsgs.length)]}\n${ctx.reportErrTxt}${content ? `\n\n\`${content}\`` : ``}`
ctx.emoji = require('./config/emoji')
ctx.fail = `<:NyxCross:942164350683189339>`;
ctx.pass = `<:NyxTick:942164350842601482>`;
ctx.yt = `<:youtube:981954165221777408>`;
ctx.sc = `<:soundcloud:981954165146271814>`;
ctx.sp = `<:spotify:981954165309849700>`;
ctx.file = `<:link:982985421560643594>`;
ctx.link = `<:link:982985421560643594>`;
ctx.yturl = `https://i.nyx.bot/youtube.png`;
ctx.scurl = `https://i.nyx.bot/soundcloud.png`;
ctx.spurl = `https://i.nyx.bot/spotify.png`;
ctx.youtube = ctx.yt;
ctx.soundcloud = ctx.sc;
ctx.spotify = ctx.sp;
ctx.youtubeurl = ctx.yturl
ctx.soundcloudurl =ctx.scurl
ctx.spotifyurl = ctx.spurl
ctx.nc = `<:NC:738997836036833311>`;
ctx.processing = `<a:processing:981954151414116392>`;
ctx.slash = `<:slash:938546891287826433>`
ctx.msgs = require('./res/messages.json');
ctx.connectionErrors = 0;
ctx.package = require('./package.json');
ctx.slowdown = {}
ctx.streamCache = {}
ctx.listeners = new Oceanic.Collection();
ctx.config = require("./config.json");
ctx.musicApi = ctx.config.musicApi;
ctx.musicApi.pendingServers = [];
/*ctx.musicApi.cycle = require(`cron`).job(`* * * * *`, () => {
     console.log(`cycling musicApi servers in 15 seconds!`);

     setTimeout(() => {
          if(ctx.musicApi.pendingServers.length > 0) {
               console.log(`cycling musicAPI servers; ${ctx.musicApi.locations.length} -> ${ctx.musicApi.pendingServers.length}`);
               ctx.musicApi.locations = [...ctx.musicApi.pendingServers]; ctx.musicApi.pendingServers = [];
               console.log(`cycled! serverlist: ${ctx.musicApi.locations.map(location => `\n- ${location}`).join(``)}`)
          } else console.log(`no servers are pending! ignoring this cycle.`)
     }, 15000)
}).start()*/ // musicAPI is not handled through nyx, timer is unnecessary.
ctx.keys = ctx.config.keys
ctx.cache = {
     joinLeave: {},
     msgsPerHour: {},
     snipedMsgs: {},
     songLookupResults: {},
     referencedMessages: [],
     audioStreams: new Map(),
};
ctx.totalCmds = 0;
ctx.cmds = new Oceanic.Collection();
ctx.moduleSetting = new Map();
ctx.cmdsObject = {};
ctx.core = core;
ctx.timer = require('cron').job(`* * * * *`, /*runs every minute*/ () => core.runTimer(ctx))
ctx.timer2 = require('cron').job(`0 0 * * *`, /*runs every day at 12AM*/ () => core.dailyTimer(ctx))
ctx.statsTimers = {
     saveCache: require('cron').job(`*/5 * * * * *`, () => core.stats.saveCache(ctx)),
     minute: require('cron').job(`* * * * *`, () => core.stats.minute(ctx)),
     hour: require('cron').job(`0 * * * *`, () => core.stats.hour(ctx)),
     day: require('cron').job(`0 0 * * *`, () => core.stats.day(ctx)),
     month: require('cron').job(`0 0 1 * *`, () => core.stats.month(ctx)),
     //minute: require('cron').job(`*/3 * * * * *`, () => core.stats.minute(ctx)),
     //hour: require('cron').job(`*/3 * * * * *`, () => core.stats.hour(ctx)),
     //day: require('cron').job(`*/3 * * * * *`, () => core.stats.day(ctx)),
     //month: require('cron').job(`*/3 * * * * *`, () => core.stats.month(ctx)),
}
ctx.aliases = new Oceanic.Collection();
ctx.events = new Oceanic.Collection();
ctx.modules = new Oceanic.Collection();
ctx.groups = {
     array: [],
};
ctx.music = {};
ctx.activeTimers = new Map();
ctx.utils = require("./system/initUtil")(ctx);
global.utils = ctx.utils;

const lastGitModification = new Date(require(`child_process`).execSync(`git log -1 --pretty="format:%ci"`).toString());
const lastUpdated = ctx.utils.timeConvert(Date.now() - lastGitModification.getTime(), true)
const commit = require(`child_process`).execSync(`git rev-parse --short HEAD`).toString();

ctx.git = { lastGitModification, lastUpdated, commit};

ctx.elevated = config.elevated;
ctx.icons = require('./res/webhookIcons.json');
ctx.prefix = config.prefix;
ctx.seqModel = {};
ctx.libs = {
     moment: moment,
     eris: Oceanic,
     oceanic: Oceanic,
     superagent: superagent,
     fs: fs,
     ytdl: require("ytdl-core"),
     ytsr: require('ytsr'),
     getaudioduration: getAudioDurationInSeconds,
     readTags: require("read-audio-tags"),
     moment: require("moment"),
     sckey: require('soundcloud-key-fetch'),
};

console.debugLog = console.d

console.debugLog(`DEBUGGING IS ENABLED`);

core.trackEvents(ctx, ctx.bot, `bot`)

let a;

core.boxLog(`┃ Creating commands object...`)
core.initCommands(ctx).then(c => {
     refreshTimeout()
     cmdsMade = c;
     core.boxLog(`┃ Creating bot events...`)
     core.initEvents(ctx).then(e => {
          refreshTimeout()
          eventsMade = e;
          if(ctx.forkedFromSpawner) {
               process.send(`getShards`);
          }; core.noEventThing(ctx).then(ne => {
               refreshTimeout(`[!] UNABLE TO FINISH UP IN TIME`)
               timeoutEventBullshit = ne;
               core.boxLog(`┃ Generating stream instances...`)
               core.fetchKeys(ctx).then(() => {
                    core.initDatabase(ctx).then(() => {
                         refreshTimeout(`[!] COULDN'T ESTABLISH A CONNECTION TO DISCORD'S API`)
                         core.boxLog(`┃ Creating a connection to Discord's API...`)
                         const readyFunc = async () => {
                              clearTimeout(noDiscordConnectionTimeout);
                              let commandsWithoutInteraction = ctx.cmds.map(a => a.name).filter(c => !ctx.discordInteractionObject.find(o => o.name === c));
                              core.boxLog(`┃ ${ctx.cmds.size} commands total`)
                              core.boxLog(`┃ - ${ctx.discordInteractionObject.length} with Discord interactions`)
                              core.boxLog(`┃ - ${commandsWithoutInteraction.length} without interactions.`)
                              ctx.rawDiscordInteractionObject = Object.assign({}, ctx.discordInteractionObject)
                              ctx.discordInteractionObject = await ctx.bot.application.bulkEditGlobalCommands(ctx.discordInteractionObject)
                              noDiscordConnectionTimeout = null;
                              ready = true;
                              await core.system(ctx)
                              if(startArgs.length !== 0 && startArgs[0].toLowerCase() == `convert`) {
                                   await core.filesToDB(ctx);
                                   return process.exit(0)
                              } else {
                                   core.otherInit(ctx);
                                   await core.initWebhooks(ctx);
                                   if(!ctx.forkedFromSpawner) await ctx.cleanupDebug();
                                   const timeTaken = await ctx.utils.timeConvert(Date.now() - ctx.started)
                                   core.boxLog(
                                        `┃ ${ctx.bot.user.username} is ready! Serving ${ctx.bot.guilds.size} guilds.\n┃ ${cmdsMade} commands and ${eventsMade} / ${timeoutEventBullshit} events\n┃ Completed startup within ${timeTaken}!`
                                   ); console.l(`┗${`━`.repeat(45)}┛`);

                                   core.restartMusicSessions(ctx)

                                   ready = true;
                                   ctx.bot.on("messageCreate", msg => commandHandler(ctx, msg));
                                   //ctx.bot.on("interactionCreate", int => interactionHandler(ctx, int))
                                   if(ctx.config.uptimePingURL) {
                                        console.d(`uptime ping URL set, enabling! (${ctx.config.uptimePingURL})`)
                                        // basically if there is a url under this property, nyx will send a GET request by the minute.
                                        let cron = require('cron')
                                        let job = new cron.CronJob(`* * * * *`, () => {
                                             //require(`superagent`).get(ctx.config.uptimePingURL).then(() => {
                                             require(`superagent`).post(ctx.config.uptimePingURL).send({
                                                  service: `Bot`,
                                                  token: 'juNESTAMPosTRIOnaRyPOnG'
                                             }).then(() => {
                                                  console.d(`successfully sent uptime ping to url ${ctx.config.uptimePingURL}`)
                                             }).catch(e => {
                                                  console.de(`failed to send uptime ping to url ${ctx.config.uptimePingURL} -- ${e}`)
                                             });
                                        }); job.start();
                                   }
                                   if(fs.existsSync(`restart.json`)) {
                                        try {
                                             const info = JSON.parse(fs.readFileSync(`restart.json`));
                                             fs.unlinkSync(`restart.json`);
                                             const msg = await ctx.bot.rest.channels.getMessage(info.channel, info.message);
                                             msg.edit(`${ctx.pass} Successfully restarted!`)
                                        } catch(e) {}
                                   }
                              }
                              readyEmitter.emit(`ready`)
                              //setTimeout(() => readyEmitter.emit(`ready`), 5000)
                         }; const saveGuildConfigs = () => new Promise(async res => {
                              core.boxLog(`┃ Caching server preferences...`);
                              ctx.seq.models.Server.findAll().then(async servers => {
                                   core.boxLog(`┃ Found ${servers.length} guild configs.`)
                                   const guilds = ctx.bot.guilds.map(g => g.id);
                                   let currentProgress = 0;

                                   let interval = setInterval(() => {
                                        core.boxLog(`┃ ${Math.round((currentProgress/guilds.length)*100)}% configs processed... (${Number(currentProgress)+1}/${guilds.length})`)
                                   }, 2000)

                                   for (i in guilds) await new Promise(async r => {
                                        clearTimeout(noDiscordConnectionTimeout);
                                        let id = guilds[i];
                                        currentProgress = i;
                                        try {
                                             let settings = servers.find(s => s.toJSON().id == id);
                                             if(settings) {
                                                  const g = ctx.bot.guilds.get(id);
                                                  g.guildSettingRaw = settings;
                                                  g.guildSetting = settings.toJSON();
                                             } else {
                                                  settings = ctx.seq.models.Server.build({id});
                                                  const g = ctx.bot.guilds.get(id);
                                                  g.guildSettingRaw = settings;
                                                  g.guildSetting = settings.toJSON();
                                             };
                                        } catch(e) {console.de(e)}
                                        if(i % 50 === 0) {
                                             setTimeout(() => r(), 1)
                                        } else r()
                                        // this uses a timeout so it doesn't kill the cpu and prevents the bot from disconnecting from discord's api
                                   });

                                   clearInterval(interval);

                                   res()
                              })
                         });
                         
                         if(ctx.pendingShardIDs) {
                              ctx.core.getDiscordGateway(ctx).then(async () => {
                                   core.boxLog(`┃ Connection established to Discord's API!`)
                                   core.boxLog(`┃ Spawning shards...`)
                                   ctx.core.spawnDiscordShards(ctx).then(async a => {
                                        refreshTimeout()
                                        await ctx.bot.editStatus(`dnd`, {name: `loading... / nyx.bot`, type: 3});
                                        core.boxLog(`┃ Successfully spawned !`)
                                        if(!ready) refreshTimeout(`[!] A SHARD HAS NOT BEEN SET AS READY WITHIN 30 SECONDS, QUITTING`)
                                        ctx.bot.once("ready", async () => {
                                             //refreshTimeout(`[!] COULDN'T SAVE GUILD CONFIGS????`)
                                             clearTimeout(noDiscordConnectionTimeout);
                                             core.boxLog(`┃ Discord ready event fired!`);
                                             saveGuildConfigs().then(() => {
                                                  readyFunc()
                                             })
                                        });
                                   });
                              });
                         } else ctx.bot.connect().then(r => {
                              core.boxLog(`┃ Connection established to Discord's API!`)
                              refreshTimeout(`[!] COULDN'T ESTABLISH A CONNECTION TO DISCORD'S API`);

                              let exitAttempts = 0;

                              const exitFunc = (code) => {
                                   exitAttempts++;

                                   let maxAttempts = 3

                                   if(exitAttempts >= maxAttempts) {
                                        console.log(`${exitAttempts}/${maxAttempts} close events registered! Terminating.`);
                                        process.exit(0)
                                   } else {  
                                        console.log(`Exit called from host with code ${code} -- ${exitAttempts}/${maxAttempts} before ungraceful termination.`)
                                        if(ctx && ctx.core && ctx.core.exit && typeof ctx.core.exit == `function`) {
                                             ctx.core.exit(ctx)
                                        } else {
                                             console.warn(`Exit func is not a func! Closing prematurely.`);
                                             process.exit(0)
                                        }
                                   }
                              };
                              
                              //process.on('beforeExit', exitFunc);
                              //process.on('exit', exitFunc);
                              process.on('SIGINT', exitFunc);
                              process.on('SIGTERM', exitFunc);
                              process.on('SIGUSR1', exitFunc);
                              process.on('SIGUSR2', exitFunc);

                              ctx.bot.once("ready", async () => {
                                   setInterval(() => ctx.bot.shards.filter(s => !s.ready || s.status != `ready`).forEach(s => {
                                        try {
                                             s.connect()
                                        } catch(e) {}
                                   }), 15000)
                                   //refreshTimeout(`[!] COULDN'T SAVE GUILD CONFIGS????`)
                                   core.boxLog(`┃ Discord ready event fired!`);
                                   saveGuildConfigs().then(() => {
                                        readyFunc()
                                   })
                              });
                         });
                    })
               })
          })
     })
})

ctx.bot.on('shardReady', id => {
     if(!ready) {
          refreshTimeout(`[!] A SHARD HAS NOT BEEN SET AS READY WITHIN 30 SECONDS, QUITTING`)
          core.boxLog(`┃ Shard #${id} is now ready.`)
          ctx.shardConnectedTime[`${id}`] = Date.now()
     }
});

ctx.bot.on(`unknown`, (packet, id) => console.d(`--------------- UNKNOWN PACKET ---------------\nID: ${id}\nPACKET:`, packet))

process.on("uncaughtException", err => errHandling(ctx, `uncaughtexception`, err));

process.on("unhandledRejection", err => errHandling(ctx, `promise`, err));

process.on("rejectionHandled", err => errHandling(ctx, `handledpromise`, err));

// .......*/((///*/////********,.,,,,,,,.. ...,,.,,,,,....,,,,,,.....,,,,,,,,,,,,,.
// *..*((&@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#.....,,,,,,...,,,,.........,,,,,.......
// .#&@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&&#/,.,,,.....,,,,.......     ........  ..
// ,#%%%%%%#%##########%%%#%%%#%&&&%%&&%((((#%%%%##/***,..   ....,,,,,..   ..,,,...
// ./(///(((%%%%%%%%%%%%##%%%%%%%%%%%%%#((/%@@@@@@@@@@@@@@&&&(((///*****,,,........
// .        *&&&&&&&&&&&&%&%%%%,,,,,,,*///(%@@@@@@@@@@@@@@@@@@@@@@@@@@@&&&%(/*,,.,*
// ,,,...,, (&&&&&&&&&&&&&&&&&%.      ./###&@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&&&%(/
// #######%%%######%%%%#######%(####(//(###&@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&&
// /***//(%%%#############%##******//*//((%&@@@@@@@@@@@@@@@@@@@@@@@@@@@&&&&%%######
// /*//((//(*//////////////**///////**/#%%@@@@@@@@@@@@@@@@@@@@@&%###########%%%%##(
// ***,,,*,***************/////(////,.*(((##%&%%%#(/((((#%%###%%#####%%#((#%%%##%%(
// ,**********,,*********,*********,,*((((((#%%%%#(/((//#######(#%%%%%##%%%%##%%%#*
// %##%%%##/,,,,,,,,****,,*,,,,*,,,,/#(/((((####%(//////(#######%%%%%#&%%%%###%%%(,
// ((####%%/.,,,,,,,,,,,,,,,,./%#%%%%#((((((%###%(//////(####%%%%####%########//,,.
// ######//*,,,,,,,,,,,,,,,,,/(#(((##(/////(%%%%%(((##(#%%%%%%%%%######%%%%##/,,...
// %&%%%%(((((((((((/////((((##(((((((((((((%%%%#((((((#%######%###%%&##((*,,,**.
// ((#%%%##((//////////////((((//((//((((((######((////#%######((%%%(,,..........
// &%#(//*///((((((((((((((///////////((//(##%%%%%#%###%&%#%%###%##((#(/**,. ......
// "your days are numbered" - big chicken fuck
// nyx v2 -- written by Syl#3242 (syl@nyx.bot) and NotNite#0001 (hi@notnite.com)

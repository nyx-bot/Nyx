const fs = require('fs')

module.exports = (ctx) => new Promise( async (res, rej) => {
     const SCDL = require("soundcloud-downloader").create;
     const fs = require('fs');
     let SCKEY;
     if(ctx && ctx.config && ctx.config.keys && ctx.config.keys.soundcloud) {
          console.d(`Soundcloud key is provided in config.json! Testing...`)
          let key = ctx.config.keys.soundcloud;
          ctx.libs.sckey.testKey(key).then(r => {
               if(r) {
                    SCKEY = key;
                    console.d(`Soundcloud key is valid! Setting!`)
               } else {
                    SCKEY = null;
                    console.d(`Soundcloud key is invalid. Falling back to public key.`)
               }
          }).catch(e => {SCKEY = null;})
     };
     if(!SCKEY) {
          if(fs.existsSync(`./etc/sc.key`)) { 
               console.d(`previous key found`)
               const lastUpdated = fs.statSync(`./etc/sc.key`).mtimeMs;
               if((Date.now() - lastUpdated) > 1.296e+8) { // if it was last updated over 36 hours ago, refresh key.
                    console.d(`previous key older than 36 hours`)
                    SCKEY = await ctx.libs.sckey.fetchKey(); fs.writeFileSync(`./etc/sc.key`, SCKEY.toString())
               } else {
                    console.d(`previous key is younger than 36 hours`)
                    const k = fs.readFileSync(`./etc/sc.key`).toString();
                    const r = await ctx.libs.sckey.testKey(`${k}`)
                    
                    if(r) {
                         console.d(`previous key is valid`)
                         SCKEY = k;
                    } else {
                         console.d(`previous key is invalid; fetching new key`)
                         SCKEY = await ctx.libs.sckey.fetchKey(); fs.writeFileSync(`./etc/sc.key`, SCKEY.toString())
                    }
               }
          } else {
               SCKEY = await ctx.libs.sckey.fetchKey(); fs.writeFileSync(`./etc/sc.key`, SCKEY.toString())
          }
     }
     ctx.libs.scdl = new SCDL({clientID: SCKEY});
     function withCookie(key) {
          withoutCookie();
          console.d(`TOKEN IS REGISTERED FOR YOUTUBE (cookies.txt)`);
          ctx.libs.ytsr = (...args) => new Promise(async (res, rej) => {
               console.d(`------------------------------\nyoutube cookie REGISTERED in YTSR\n------------------------------`);
               const originalArgs = [...args]
               const ytsr = require('ytsr');
               if(!args[1]) args[1] = {}
               if(!args[1].requestOptions) args[1].requestOptions = {};
               if(!args[1].requestOptions.headers) args[1].requestOptions.headers = {};
               const useCookie = key.toRequestHeader().replace('Cookie: ','');
               console.d(`GIVING MINIGET COOKIE ${useCookie.substring(0, 50)}... (FOR YTSR)`)
               args[1].requestOptions.headers.Cookie = useCookie;
               try {
                    stream = await ytsr(...args);
                    console.d(`COOKIE HAS BEEN ACCEPTED IN YTSR`)
               } catch(e) {
                    if(`${e}`.toLowerCase().includes(`5`)) return rej(new Error(`Youtube is throwing error 5XX; ${e}`))
                    else try {
                         console.d(`cookie declined, or smth else lol -- falling back to without key`);
                         stream = await ytsr(...originalArgs);
                    } catch(ee) {
                         console.de(ee)
                         rej(`Unable to get search results;\n${e}\n${ee}`)
                    }
               };
               if(stream) return res(stream)
          }); 
          ctx.libs.ytdl.download = (...args) => new Promise(async (res, rej) => {
               console.d(`------------------------------\nyoutube cookie REGISTERED in YTDL\n------------------------------`);
               
               if(typeof args[0] == `object`) {
                    console.d(`DOWNLOAD COMMAND INVOKED WITH VIDEO DETAILS`);
                    const origArgs = args.slice(0)
                    let obj = {}; if(args[1] && typeof args[1] == `object`) {obj = args[1]};
                    if(!args[1]) args[1] = {}
                    if(!args[1].requestOptions) args[1].requestOptions = {};
                    if(!args[1].requestOptions.headers) args[1].requestOptions.headers = {};
                    const useCookie = key.toRequestHeader().replace('Cookie: ','');
                    console.d(`GIVING MINIGET COOKIE ${useCookie.substring(0, 50)}...`)
                    args[1].requestOptions.headers.Cookie = useCookie
                    let stream;
                    try {
                         stream = await ctx.libs.ytdl.downloadFromInfo(...args);
                         console.d(`COOKIE HAS BEEN ACCEPTED`)
                    } catch(e) {
                         if(`${e}`.toLowerCase().includes(`5`)) return rej(new Error(`Youtube is throwing error 5XX; ${e}`))
                         else try {
                              console.d(`cookie declined, or smth else lol`)
                              stream = await ctx.libs.ytdl.downloadFromInfo(...origArgs);
                         } catch(ee) {
                              console.de(ee)
                              rej(`Unable to start stream;\n${e}\n${ee}`)
                         }
                    };
                    if(stream) return res(stream)
               } else {
                    const origArgs = args.slice(0)
                    let obj = {}; if(args[1] && typeof args[1] == `object`) {obj = args[1]};
                    if(!args[1]) args[1] = {}
                    if(!args[1].requestOptions) args[1].requestOptions = {};
                    if(!args[1].requestOptions.headers) args[1].requestOptions.headers = {};
                    const useCookie = key.toRequestHeader().replace('Cookie: ','');
                    console.d(`GIVING MINIGET COOKIE ${useCookie.substring(0, 50)}...`)
                    args[1].requestOptions.headers.Cookie = useCookie
                    let stream;
                    console.d(args)
                    try {
                         stream = await ctx.libs.ytdl(...args);
                         console.d(`COOKIE HAS BEEN ACCEPTED`)
                    } catch(e) {
                         if(`${e}`.toLowerCase().includes(`5`)) return rej(new Error(`Youtube is throwing error 5XX; ${e}`))
                         else try {
                              console.d(`cookie declined, or smth else lol`)
                              stream = await ctx.libs.ytdl(...origArgs);
                         } catch(ee) {
                              console.de(ee)
                              rej(`Unable to start stream;\n${e}\n${ee}`)
                         }
                    };
                    if(stream) return res(stream)
               }
          }); ctx.libs.ytdl.getInfoForDownloadThing = (...args) => new Promise(async (res, rej) => {
               console.d(`------------------------------\nyoutube cookie REGISTERED in YTDL for getting track info\n------------------------------`)
               const origArgs = args.slice(0)
               let obj = {}; if(args[1] && typeof args[1] == `object`) {obj = args[1]};
               if(!args[1]) args[1] = {}
               if(!args[1].requestOptions) args[1].requestOptions = {};
               if(!args[1].requestOptions.headers) args[1].requestOptions.headers = {};
               const useCookie = key.toRequestHeader().replace('Cookie: ','');
               console.d(`GIVING MINIGET COOKIE ${useCookie.substring(0, 50)}...`)
               args[1].requestOptions.headers.Cookie = useCookie
               let stream;
               try {
                    stream = await ctx.libs.ytdl.getInfo(...args);
                    console.d(`COOKIE HAS BEEN ACCEPTED`)
               } catch(e) {
                    if(`${e}`.toLowerCase().includes(`5`)) return rej(new Error(`Youtube is throwing error 5XX; ${e}`))
                    else try {
                         console.d(`cookie declined, or smth else lol`)
                         stream = await ctx.libs.ytdl.getInfo(...origArgs);
                    } catch(ee) {
                         console.de(ee)
                         rej(`Unable to get video details;\n${e}\n${ee}`)
                    }
               };
               if(stream) return res(stream)
          })
     }; function withoutCookie() {
          console.d(`TOKEN IS NOT REGISTERED FOR YOUTUBE.`)
          const download = (...args) => new Promise(async (res, rej) => {
               console.d(`------------------------------\nyoutube cookie NOT found in config.json\n------------------------------`)
               if(args[0].videoDetails) {
                    console.d(`DOWNLOAD COMMAND INVOKED WITH VIDEO DETAILS`);
                    let stream;
                    try {
                         stream = await ctx.libs.ytdl.downloadFromInfo(...args);
                    } catch(e) {
                         if(args[0].videoDetails.videoId) {
                              try {
                                   stream = await ctx.libs.ytdl(args[0].videoDetails.videoId);
                              } catch(ee) {
                                   console.de(ee)
                                   if(`${ee}`.toLowerCase().includes(`5`)) return rej(new Error(`Youtube is throwing error 5XX; ${ee}`))
                                   return rej(`Unable to start stream;\n${e}\n${ee}`)
                              };
                         } else {
                              return rej(`Unable to start stream;\n${e}`)
                         }
                    };
                    if(stream) return res(stream)
               } else {
                    let stream;
                    try {
                         stream = await ctx.libs.ytdl(...args);
                    } catch(e) {
                         if(`${e}`.toLowerCase().includes(`5`)) return rej(new Error(`Youtube is throwing error 5XX; ${e}`))
                         return rej(`Unable to start stream;\n${e}`)
                    };
                    if(stream) return res(stream)
               }
          }), getInfo = (...args) => new Promise(async (res, rej) => {
               console.d(`------------------------------\nyoutube cookie NOT found in config.json for getting track info\n------------------------------`)
               try {
                    stream = await ctx.libs.ytdl.getInfo(...args);
                    console.d(`COOKIE HAS BEEN ACCEPTED`)
               } catch(e) {
                    if(`${e}`.toLowerCase().includes(`5`)) return rej(new Error(`Youtube is throwing error 5XX; ${e}`))
                    else try {
                         console.d(`cookie declined, or smth else lol`)
                         stream = await ctx.libs.ytdl.getInfo(...origArgs);
                    } catch(ee) {
                         console.de(ee)
                         rej(`Unable to get video details;\n${e}\n${ee}`)
                    }
               };
               if(stream) return res(stream)
          });

          ctx.libs.ytdl.download = (...args) => download(...args);
          ctx.libs.ytdl.downloadNoKey = (...args) => download(...args);
          ctx.libs.ytdl.getInfoForDownloadThing = (...args) => getInfo(...args);
          ctx.libs.ytdl.getInfoForDownloadThingNoKey = (...args) => getInfo(...args);
     }
     //let token = ctx.config && ctx.config.keys && ctx.config.keys.youtubeCookie && ctx.config.keys.youtubeCookie.length > 750 ? ctx.config.keys.youtubeCookie.replace(/\r?\n|\r/g, '') : null;
     if(fs.existsSync(`cookies.txt`)) {
          const cookiefile = require('cookiefile')
          let cookies;
          try {
               cookies = new cookiefile.CookieMap(`cookies.txt`)
          } catch(e) {
               withoutCookie()
          }; if(cookies) {
               withCookie(cookies)
          }
     } else {
          withoutCookie()
     }
     res()
})
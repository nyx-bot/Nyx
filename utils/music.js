const { EventEmitter } = require('events')

const trackLookupEmitter = new EventEmitter();

const url = /^(https:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
const youtube = /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.?be)\/.+$/;
const ytplaylist = /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.?be)\/playlist\?list=(.+)$/;
const soundcloud = /^((https?:\/\/)?(www\.|m\.)?soundcloud\.com\/).+\/.+$/;
const scplaylist = /^((https?:\/\/)?(www\.|m\.)?soundcloud\.com\/).+(sets)\/.+$/;
const spotifyplaylist = /^(https:\/\/open\.spotify\.com)\/(playlist|album)\/([a-z0-9]+)/
const spotify = /^(https:\/\/open\.spotify\.com)\/track\/([a-z0-9]+)/
const discordfile = /^(https?:\/\/)?(www\.)?(cdn\.discordapp\.com|cdn\.discord\.?com)\/(.*?)\.(mp3|ogg|flac|wav|webm|mp4|mov|mkv)$/;

const getMusicCard = (ctx, content, payload) => new Promise(async res => {
    console.d(payload)

    let sent = false;

    let now = Date.now();

    setTimeout(() => {
        if(!sent) {
            sent = true;
            res(undefined);
            console.d(`music card timed out!`)
        }
    }, 7500);

    if(content.includes(`starting `)) {
        payload.position = content.split(`starting`).slice(-1)[0].replace(/\*/g, ``).trim();
        content = content.split(`starting`).slice(0, -1).join(`starting`)
    }

    ctx.libs.superagent.post(/*`https://nyx.bot/api/v1/musiccard`*/ `${ctx.config.musicApi.musicImagesEndpoint}nyxmusiccard`).set(`authorization`, ctx.config.musicApi.key).send(payload).then(r => r.body).then(async r => {
        let properlyFinished = false;
        if(!sent) {
            properlyFinished = true;
            sent = true;
            console.d(r)
            res({
                content: `${content.split(` `)[0]} Done!`,
                embeds: [
                    {
                        color: ctx.utils.colors('random'),
                        description: content.split(` `).slice(1).join(` `).split(`queue`)[0] + `queue`,
                        image: {
                            url: r.url
                        }
                    }
                ]
            });
        }
    }).catch(e => {
        if(!sent) {
            sent = true;
            res({
                content,
            })
        }
    })
})

function STANDARDPLAYARGS(eq) {
    if(!eq) eq = {};

    console.d(eq)

    let bassMult = eq.bass, trebleMult = eq.treble, samplemult = eq.samplemult;

    let encoderArgs = [];

    console.d(`RAW ARGS: ${bassMult}; ${trebleMult}`)
    if(typeof bassMult != `number`) bassMult = 0;
    if(typeof trebleMult != `number`) trebleMult = 0;
    const afArg = `firequalizer=gain_entry='entry(31,${4*bassMult});entry(62,${2.7*bassMult});entry(125,${0.6*bassMult});entry(2000,${1.15*trebleMult});entry(4000,${2.5*trebleMult});entry(8000,${3.7*trebleMult});entry(16000,${4*trebleMult})'`
    console.d(` ---------- \nBASS: ${bassMult}; TREB: ${trebleMult}\nARGUMENT USED: ${afArg}\n ---------- `);

    encoderArgs.push(`-af`, afArg)

    let filterA = [];
    if(samplemult) filterA.push(`asetrate=48000*${samplemult}`);

    if(filterA.length > 0) {
        filterA.push(`aresample=48000`)
        encoderArgs.push(`-filter:a`, filterA.join(`,`))
    };

    //encoderArgs.push(`-b:a`, `256k`)

    const argsObject = {
        inlineVolume: true, 
        voiceDataTimeout: -1, 
        frameDuration: 60,
        samplingRate: 48000,
        encoderArgs
    };
    console.d(argsObject)
    return argsObject
}

const lookupTrack = (ctx, msg, o) => new Promise(async resolv => {
    let s = `${o[5]} official audio`
    if(typeof ctx.cache.songLookupResults[s] == `object`) {
        console.d(`A PREVIOUS SEARCH HAS BEEN DONE FOR THE SONG ${s}; ${ctx.cache.songLookupResults[s].title ? `HOWEVER HAS NOT BEEN COMPLETE, SO WE WILL ATTACH A LISTENER` : `THE SEARCH HAS BEEN COMPLETE, SO WE CAN RESOLVE IT NOW.`}`)
        if(!ctx.cache.songLookupResults[s].title) {
            let resolved = false;
            const eventTrigger = song => {
                resolved = true;
                if(!song) return lookupTrack(ctx, msg, o).then(resolv);
                resolv(song)
            }; const l = trackLookupEmitter.once(s, eventTrigger); setTimeout((uid) => {
                if(!resolved && ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].uniqueId == uid) {
                    trackLookupEmitter.removeListener(s, eventTrigger);
                    delete ctx.cache.songLookupResults[s]
                    resolv(null);
                }
            }, 5000, ctx.music[msg.channel.guild.id].uniqueId);
        } else return resolv(ctx.cache.songLookupResults[s])
    } else ctx.cache.songLookupResults[s] = {};

    const artist = `${o[5]}`.split(` - `)[0];
    const title = `${o[5]}`.split(` - `)[1];

    console.d(`finding ${artist} - ${title}... (${o[1][0]})`)

    ctx.libs.superagent.post(`${ctx.musicApi.location}findMatchingSong`).send({
        title: o[5],
        duration: o[1][0]
    }).set(`auth`, `${ctx.musicApi.key}`).then(r => r.body).then(r => {
        if(r.result && r.result.title && r.result.url) {
            console.d(r)

            const ytResult = {
                id: r.result.url.split(`watch?v=`)[1],
                duration: r.result.duration[0],
            }

            ctx.cache.songLookupResults[s] = ytResult;
            trackLookupEmitter.emit(s, ytResult)
            
            setTimeout(() => {
                delete ctx.cache.songLookupResults[s];
            }, 2.7e+6)
            
            resolv(ytResult)
        } else {
            delete ctx.cache.songLookupResults[s];
            trackLookupEmitter.emit(s, false)
            resolv(null)
        }
    }).catch(e => {
        delete ctx.cache.songLookupResults[s];
        trackLookupEmitter.emit(s, false)
        console.de(`lookuptrack failed`, e); resolv(null)
    })
});

const getStreamLegacy = (ctx, np, waitForReadable, addToCache) => new Promise(async(res, rej) => {
    console.d(`Falling back to legacy streaming!`)
    if(addToCache && ctx.streamCache[np[7]]) {
        return res(ctx.streamCache[np[7]])
    }
    var stream = require('stream')
    var streamUrl = url => new Promise((res, rej) => { 
        try {
            var rs = new stream.PassThrough()
            const request = require(`request`)(url).pipe(rs);
            request.once(`readable`, () => {res(rs)})
        } catch(e) {
            console.error(e);
            rej(e)
        }
    });
    let source = np[6].toLowerCase();
    let play;
    if(typeof np[10] == `function`) {
        satisfied = true;
        try {
            play = await np[10]()
        }catch(e){
            console.de(e)
            console.d(`failed to play; going to restart getStream function without the dedicated function`);
            np.splice(10, 1);
            return getStreamLegacy(ctx, np, waitForReadable, addToCache).then(res).catch(rej)
        }
    } else {
        if(source == `yt` || (source == `sp` && np[8])) {
            satisfied = true;
            try {
                play = await ctx.libs.ytdl.download(`${np[5]}`, { filter: 'audioonly', quality:'highestaudio' })
            }catch(e){
                try {
                    play = await ctx.libs.ytdl.download(`${np[5]}`, { filter: 'audioonly', quality:'highestaudio' })
                }catch(e){
                    try {
                        play = await ctx.libs.ytdl.download(`${np[5]}`, { filter: 'audioonly', quality:'highestaudio' })
                    }catch(e){
                        console.de(e)
                        console.l(`failed to play`)
                        return rej(e)
                    }
                }
            }
        }; if(source == `file` || source == `mp3` || source == `ogg` || source == `flac` || source == `wav` || source == `webm` || source == `mp4` || source == `mov` || source == `mkv`) {
            satisfied = true;
            try {
                play = await streamUrl(np[2])
            }catch(e){
                try {
                    play = await streamUrl(np[2])
                }catch(e){
                    try {
                        play = await streamUrl(np[2])
                    }catch(e){
                        console.de(e)
                        console.l(`failed to play`)
                        return rej(e)
                    }
                }
            }
        }; if(source == `sc`) {
            satisfied = true;
            try {
                play = await ctx.libs.scdl.download(np[2], false)
            }catch(e){
                try {
                    play = await ctx.libs.scdl.download(np[2], false)
                }catch(e){
                    try {
                        play = await ctx.libs.scdl.download(np[2], false)
                    }catch(e){
                        console.de(e)
                        console.l(`failed to play`)
                        return rej(e)
                    }
                }
            }
        }; 
    }
    if(play) {
        play.url = np[2]
        if(waitForReadable) {
            play.on('readable', () => {
                play.removeAllListeners(`readable`);
                play.readableReady = true;
                res(play);
            })
        } else {
            res(play);
            play.on('readable', () => {
                play.removeAllListeners(`readable`);
                play.readableReady = true;
                play.emit('isNowReady')
            })
        };
    } else return(rej(null))
});

const fetchFromApi = (ctx, msg2, link, msg, source, object) => new Promise(async (res, rej) => {
    try {
        console.d(`FETCHING A RESULT FROM API!!`)
        let location = `${ctx.musicApi.location}getInfo/${link}`;
        const parse = async info => {
            if(info.entries && info.entries.length >= 0) {
                const origInfoEntries = info.entries;
                info.entries = info.entries.filter(song => Number(song.duration.units.ms) <= msg.author.maxtime)
    
                if(info.entries.length === 0) {
                    if(info.entries.length !== origInfoEntries) {
                        return msg2.edit({
                            content: `${ctx.fail} I was unable to add ${ctx.utils.escapeDiscordsFuckingEditing(info.title)}! (All songs in this playlist are longer than ${(await ctx.utils.timeConvert(msg.author.maxtime))}!)`
                        })
                    } else if(info.entries.filter(song => !song.duration || song.duration.timestamp != `--:--`).length == 0) {
                        return msg2.edit({
                            content: `${ctx.fail} I was unable to add ${ctx.utils.escapeDiscordsFuckingEditing(info.title)}! (There were no parsable entries in this playlist!)`
                        })
                    }
                };
    
                info.entries = info.entries.filter(song => !song.duration || song.duration.timestamp != `--:--`)
    
                let thumbnailUrl = info.thumbnail.url
                try {
                    msg2 = await joinChannel(ctx, msg, msg2);
                } catch(e) {return};
    
                let np = info.entries.map(o => {
                    let duration = [`${Number(o.duration.units.ms)}`];
                    if(o.previewDuration) duration.unshift(`${Number(o.previewDuration)}`)
    
                    return [
                        `${ctx.utils.escapeDiscordsFuckingEditing(`${o.author && o.author.name ? o.author.name : info.author.name} - ${o.title}`)}`, 
                        duration, 
                        `${o.url}`, 
                        `${msg.author.id}`, 
                        `${o.thumbnail.url}`, 
                        `${o.videoId}`, 
                        `${ctx.musicApi.location}stream/${o.url}`, 
                        ctx.utils.randomGen(16),
                        null,
                        {
                            type: `playlist`,
                            name: info.title,
                            url: info.url
                        }
                    ]
                });
        
                let pos = await ctx.music[msg.channel.guild.id].addTrack(np)
                
                res(await msg2.edit(await ctx.utils.music.getMusicCard(ctx, `${msg2.content} added ${ctx[source || `file`] || ctx.file} **"${info.title}"** \`[${info.duration && info.duration.timestamp ? info.duration.timestamp : ctx.utils.timestampConvert(ctx.music[msg.channel.guild.id].queue[pos][1][0] || ctx.music[msg.channel.guild.id].queue[pos][1])}]\` with ${info.entries.length} song${info.entries.length === 1 ? `` : `s`} to the queue, starting ${pos === 0 ? `**now**` : pos === 1 ? `**after this song**` : `at position **${pos}**`}!`, {
                    url: ctx.music[msg.channel.guild.id].queue[pos][2],
                    icon: thumbnailUrl,
                    title: `${info.title} [${info.entries.length} song${info.entries.length === 1 ? `` : `s`}]`,
                    username: ctx.bot.users.get(ctx.music[msg.channel.guild.id].queue[pos][3]).username
                })))
            } else {
                if(!info.duration || info.duration.timestamp == `--:--`) {
                    console.d(`TESTING NEW EXPERIMENTAL LIVESTREAMING BAYBEEEE WOOOOO`)

                    let thumbnailUrl = info.thumbnail.url
                    try {
                        msg2 = await joinChannel(ctx, msg, msg2);
                    } catch(e) {return}

                    let np = [`${ctx.utils.escapeDiscordsFuckingEditing(`${info.author.name} - ${info.title}`)}`, [null], `${info.url}`, `${msg.author.id}`, `${thumbnailUrl}`, `${info.videoId}`, `${source}`, ctx.utils.randomGen(16)];

                    if(info.bitrate) {
                        np.quality = {
                            bitrate: info.bitrate,
                            maxStreamableBitrate: info.streamableBitrate
                        }
                    }

                    np[10] = location.replace(`getInfo/`, `stream/`)
            
                    let pos = await ctx.music[msg.channel.guild.id].addTrack(np)
                    
                    res(await msg2.edit(await ctx.utils.music.getMusicCard(ctx, `${msg2.content} added ${ctx[source || `file`] || ctx.file} **"${ctx.music[msg.channel.guild.id].queue[pos][0]}"** \`[${info && info.duration && info.duration.timestamp ? info.duration.timestamp : ctx.utils.timestampConvert(ctx.music[msg.channel.guild.id].queue[pos][1][0] || ctx.music[msg.channel.guild.id].queue[pos][1])}]\` to the queue, starting ${pos === 0 ? `**now**` : pos === 1 ? `**after this song**` : `at position **${pos}**`}!`, {
                        url: ctx.music[msg.channel.guild.id].queue[pos][2],
                        icon: ctx.music[msg.channel.guild.id].queue[pos][4],
                        title: ctx.music[msg.channel.guild.id].queue[pos][0],
                        username: ctx.bot.users.get(ctx.music[msg.channel.guild.id].queue[pos][3]).username
                    })))
                } else {
                    if(info.duration.units.ms > msg.author.maxtime) return msg2.edit({
                        content: `${ctx.fail} ${ctx[source || `file`] || ctx.file} I was unable to add ${ctx.utils.escapeDiscordsFuckingEditing(info.title)}! (You can't play songs longer than ${(await ctx.utils.timeConvert(msg.author.maxtime))})`
                    })
                    // MUSIC SHIT
                    let thumbnailUrl = info.thumbnail.url
                    try {
                        msg2 = await joinChannel(ctx, msg, msg2);
                    } catch(e) {return}
        
                    let duration = [`${Number(info.duration.units.ms)}`];
        
                    if(info.previewDuration) duration.unshift(`${Number(info.previewDuration)}`)
            
                    let np = [`${ctx.utils.escapeDiscordsFuckingEditing(`${info.author.name} - ${info.title}`)}`, duration, `${info.url}`, `${msg.author.id}`, `${thumbnailUrl}`, `${info.videoId}`, `${source}`, ctx.utils.randomGen(16)];

                    if(info.bitrate) {
                        np.quality = {
                            bitrate: `${info.bitrate}`,
                            maxStreamableBitrate: `${info.streamableBitrate}`
                        }
                    }

                    np[10] = location.replace(`getInfo/`, `stream/`)
            
                    let pos = await ctx.music[msg.channel.guild.id].addTrack(np)
                    
                    res(await msg2.edit(await ctx.utils.music.getMusicCard(ctx, `${msg2.content} added ${ctx[source || `file`] || ctx.file} **"${ctx.music[msg.channel.guild.id].queue[pos][0]}"** \`[${ctx.utils.timestampConvert(ctx.music[msg.channel.guild.id].queue[pos][1][0] || ctx.music[msg.channel.guild.id].queue[pos][1])}]\` to the queue, starting ${pos === 0 ? `**now**` : pos === 1 ? `**after this song**` : `at position **${pos}**`}!`, {
                        url: ctx.music[msg.channel.guild.id].queue[pos][2],
                        icon: ctx.music[msg.channel.guild.id].queue[pos][4],
                        title: ctx.music[msg.channel.guild.id].queue[pos][0],
                        username: ctx.bot.users.get(ctx.music[msg.channel.guild.id].queue[pos][3]).username
                    })))
                }
            }
        }
    
        const origMessage = msg2.content

        if(object) {
            parse(object)
        } else require('superagent').get(location).set(`auth`, ctx.musicApi.key).then(r => r.body).then(parse).catch(async e => {
            console.error(`${e}`);
            location = `${ctx.musicApi.location}getInfo/${link}`;
            await msg2.edit({
                content: msg2.content + ` (still trying...)`
            })
            require('superagent').get(location).set(`auth`, ctx.musicApi.key).then(r => r.body).then(parse).catch(async e => {
                console.error(`${e}`);
                location = `${ctx.musicApi.location}getInfo/${link}`;
                await msg2.edit({
                    content: msg2.content + ` (***still*** trying...)`
                })
                require('superagent').get(location).set(`auth`, ctx.musicApi.key).then(r => r.body).then(parse).catch(async e => {
                    console.error(e);
                    return msg2.edit({
                        content: `${ctx.fail} I was unable to add \`${ctx.utils.escapeDiscordsFuckingEditing(origMessage.split(`\``).slice(1, -1).join(`\``))}\`! (This media source is likely not supported!)`
                    })
                })
            })
        })
    } catch(e) {
        console.error(e)
    }
});

const getStream = (ctx, np, waitForReadable, addToCache, msg, fetchOnly, startTime) => new Promise(async(res, rej) => {
    console.d(startTime)
    var stream = require('stream');

    var rs = new stream.PassThrough();

    console.d(`Using experimental musicAPI streaming!`)

    let link = np[2];

    if(`${np[10]}`.includes(`?startTime=`)) {
        console.d(`url includes ?startTime, trimming...`);
        np[10] = `${np[10]}`.split(`?startTime=`)[0]
    };

    if(`${np[10]}`.includes(`&startTime=`)) {
        console.d(`url includes &startTime, trimming...`);
        np[10] = `${np[10]}`.split(`&startTime=`)[0]
    };

    //if(np[6] == `sp` && !np[8]) await ctx.music[msg.channel.guild.id].fetchTrack(np);

    //if(np[8]) link = `https://www.youtube.com/watch?v=${np[5]}`;

    const parseResponse = (location, res, rej, response) => {
        if(response.statusCode == 200 && !fetchOnly) {
            if(!location.includes(`&startTime=`)) {
                let index = ctx.music[msg.channel.guild.id].queue.findIndex(s => s[7] == np[7]);
                ctx.music[msg.channel.guild.id].queue[index][10] = location;
            };
            np.stream = response;
            np.passthru = rs;
            response.pipe(rs)
            if(waitForReadable) {
                rs.on(`readable`, () => {
                    rs.removeAllListeners(`readable`);
                    rs.readableReady = true;
                    res(rs)
                    rs.emit('isNowReady')
                })
            } else {
                res(rs);
                rs.on('readable', () => {
                    rs.removeAllListeners(`readable`);
                    rs.readableReady = true;
                    rs.emit('isNowReady')
                })
            }
        } else if(response.statusCode != 200) {
            rej(new Error(`status not 200; ${response.statusCode}`))
        } else res()
    };

    if(fetchOnly) {
        console.d(`only fetching track!`);
        let location = `${ctx.musicApi.location}getInfo/${link}`;

        const process = (r) => {
            if(r.redirects && r.redirects.length > 0) {
                console.d(`resolving with ${r.redirects.slice(-1)[0]}`)
                np[10] = r.redirects.slice(-1)[0]
                res(r.redirects.slice(-1)[0])
            } else res(`${location.replace(`&nyxPreFetch=true`, ``).replace(`/getInfo`, `/stream`)}`)
        };

        require('superagent').get(location).set(`auth`, ctx.musicApi.key).buffer(false).end((e, r) => {
            if(!e) {
                process(r)
            } else {
                console.error(e);
                location = `${ctx.musicApi.location}getInfo/${link}`
                require('superagent').get(location).set(`auth`, ctx.musicApi.key).buffer(false).end((e, r) => {
                    if(!e) {
                        process(r)
                    } else {
                        console.error(e);
                        location = `${ctx.musicApi.location}getInfo/${link}`
                        require('superagent').get(location).set(`auth`, ctx.musicApi.key).buffer(false).end((e, r) => {
                            if(!e) {
                                process(r)
                            } else {
                                console.de(`${e}`); res(null);
                            }
                        });
                    }
                });
            }
        });

        require(`superagent`).get(location).set(`auth`, ctx.musicApi.key).buffer(false).then(r => {
            console.d(`FOUNDSTREAM`, r.redirects)
            res(`${location.replace(`getInfo/`, `stream/`)}`)
        }).catch(e => {
            console.error(e);
            location = `${ctx.musicApi.location}getInfo/${link}`
            require(`superagent`).get(location).set(`auth`, ctx.musicApi.key).buffer(false).then(r => {
                console.d(res.redirects)
                res(`${location.replace(`getInfo/`, `stream/`)}`)
            }).catch(e => {
                console.error(e);
                location = `${ctx.musicApi.location}getInfo/${link}`
                require(`superagent`).get(location).set(`auth`, ctx.musicApi.key).buffer(false).then(r => {
                    console.d(res.redirects)
                    res(`${location.replace(`getInfo/`, `stream/`)}`)
                }).catch(e => {
                    console.error(e);
                    res(null)
                });
            });
        });
    } else if(np[10] && typeof np[10] == `string`) {
        let destroyed = false;
        
        np.stream = {
            destroy: () => {destroyed = true}
        };

        try {
            await new Promise((res, rej) => {require('request')({
                url: startTime ? `${np[10]}`.includes(`?`) ? np[10] + `&startTime=${startTime}` : np[10] + `?startTime=${startTime}` : np[10],
                headers: {
                    auth: ctx.musicApi.key
                }
            }).once(`error`, e => {throw e}).once(`response`, response => {
                if(destroyed) {
                    console.w(`Stream for ${location} was prematurely destroyed! Destroying response...`);
                    response.destroy();
                    res(null);
                } else parseResponse(startTime ? `${np[10]}`.includes(`?`) ? np[10] + `&startTime=${startTime}` : np[10] + `?startTime=${startTime}` : np[10], res, rej, response)
            })}).then(res)
        } catch(e) {
            console.error(e)
            try {
                np.stream = await new Promise((res, rej) => {require('request')({
                    url: startTime ? `${np[10]}`.includes(`?`) ? np[10] + `&startTime=${startTime}` : np[10] + `?startTime=${startTime}` : np[10],
                    headers: {
                        auth: ctx.musicApi.key
                    }
                }).once(`error`, e => {throw e}).once(`response`, response => {
                    if(destroyed) {
                        console.w(`Stream for ${location} was prematurely destroyed! Destroying response...`);
                        response.destroy();
                        res(null);
                    } else parseResponse(startTime ? `${np[10]}`.includes(`?`) ? np[10] + `&startTime=${startTime}` : np[10] + `?startTime=${startTime}` : np[10], res, rej, response)
                })}).then(res)
            } catch(e) {
                console.error(e);
                np.splice(10, 1);
                rawGetStream(ctx, np, waitForReadable, addToCache, msg, fetchOnly, startTime).then(res).catch(rej)
            }
        }
    } else {
        try {
            let location = `${ctx.musicApi.location}stream/${link}`
            if(startTime) location = location.includes(`?`) ? location + `&startTime=${startTime}` : location + `?startTime=${startTime}`

            console.d(location)

            //const request = await require(`request-promise`)(location);
            np.stream = await new Promise((res, rej) => {require('request')({
                url: location,
                headers: {
                    auth: ctx.musicApi.key
                }
            }).once(`error`, e => {throw e}).once(`response`, response => parseResponse(location, res, rej, response))}).then(res)
        } catch(e) {
            console.error(e);
            try {
                let location = `${ctx.musicApi.location}stream/${link}`
                if(startTime) location = location.includes(`?`) ? location + `&startTime=${startTime}` : location + `?startTime=${startTime}`
                
                console.d(location)
    
                //const request = await require(`request-promise`)(location);
                np.stream = await new Promise((res, rej) => {require('request')({
                    url: location,
                    headers: {
                        auth: ctx.musicApi.key
                    }
                }).once(`error`, e => {throw e}).once(`response`, response => parseResponse(location, res, rej, response))}).then(res)
            } catch(e) {
                console.error(e);
                try {
                    let location = `${ctx.musicApi.location}stream/${link}`
                    if(startTime) location = location.includes(`?`) ? location + `&startTime=${startTime}` : location + `?startTime=${startTime}`
                    
                    console.d(location)
        
                    //const request = await require(`request-promise`)(location);
                    np.stream = await new Promise((res, rej) => {require('request')({
                        url: location,
                        headers: {
                            auth: ctx.musicApi.key
                        }
                    }).once(`error`, e => {throw e}).once(`response`, response => parseResponse(location, res, rej, response))}).then(res)
                } catch(e) {
                    console.error(e);
                    getStreamLegacy(ctx, np, waitForReadable, addToCache).then(res).catch(rej)
                }
            }
        }
    }
});
async function nowPlayingFunc(ctx, msg, type) {
    let obj;

    if(msg.message) {
        msg.channel = msg.message.channel;
        msg.acknowledged = true;
    }

    if(ctx.music[msg.channel.guild.id]) {
        let buttons = [
            {
                type: 2,
                style: 2,
                emoji: {
                    name: `⬅️`,
                    id: null,
                },
                //label: `Restart`,
                customID: `restart`,
                disabled: false,
            },
            {
                type: 2,
                style: 2,
                //label: `-10s`,
                emoji: {
                    name: `⏪`,
                    id: null,
                },
                //label: `-30s`,
                customID: `seekback`,
                disabled: Date.now()-ctx.music[msg.channel.guild.id].startedTime < 30000 ? true : false,
            },
            {
                type: 2,
                style: ctx.music[msg.channel.guild.id].paused !== false ? 1 : 2,
                //label: ctx.music[msg.channel.guild.id].paused !== false ? `Play` : `Pause`,
                emoji: {
                    name: ctx.music[msg.channel.guild.id].paused !== false ? `▶️` : `⏸️`,
                    id: null,
                },
                customID: "pause",
                disabled: false,
            },
            {
                type: 2,
                style: 2,
                emoji: {
                    name: `⏩`,
                    id: null,
                },
                //label: `+30s`,
                customID: `seekforward`,
                disabled: (Date.now()-ctx.music[msg.channel.guild.id].startedTime + 30000) > ctx.music[msg.channel.guild.id].timeInMs ? true : false,
            },
            {
                type: 2,
                style: 2,
                emoji: {
                    name: `➡️`,
                    id: null,
                },
                //label: `Skip`,
                customID: `skip`,
                disabled: false,
            },
        ];

        let buttons2 = [
            {
                type: 2,
                style: ctx.music[msg.channel.guild.id].loop == true ? 1 : 2,
                emoji: {
                    name: `🔁`,
                    id: null,
                },
                label: `Loop`,
                customID: "loop-queue",
                disabled: ctx.music[msg.channel.guild.id].singleLoop == true ? true : false,
            },
            {
                type: 2,
                style: ctx.music[msg.channel.guild.id].singleLoop == true ? 1 : 2,
                emoji: {
                    name: `🔂`,
                    id: null,
                },
                label: `Loop song`,
                customID: "loop-song",
                disabled: false,
            },
            {
                type: 2,
                style: 2,
                //label: `Shuffle queue`,
                emoji: {
                    name: `🔀`,
                    id: null,
                },
                label: `Shuffle`,
                customID: "shuffle",
                disabled: false,
            },
        ];

        let buttons3 = [
            {
                type: 2,
                style: 4,
                emoji: {
                    name: ctx.yt.split(`:`).slice(1,2)[0],
                    id: ctx.yt.split(`:`)[2].split(`>`)[0],
                    animated: false,
                },
                label: `Create YouTube Mix`,
                customID: "ytmix",
                disabled: ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && ctx.music[msg.channel.guild.id].queue[0][2] ? false : true
            }
        ]

        let np = ctx.music[msg.channel.guild.id].queue[0];
        if(!np) {
            obj = ctx.music[msg.channel.guild.id].nowPlayingUpdate
            if(type == 'edit' && obj && obj.msg) {
                console.d(obj.msg)
                obj.msg[obj.msg.editOriginal ? `editOriginal` : `edit`]({
                    content: `**Currently Playing in** \`${msg.channel.guild.name}\``,
                    embeds: [{
                        title: `**Now Playing**`,
                        color: obj && obj.color ? obj.color : null,
                        description: `**__Nothing is playing!__**\n\n**\` ⏹️ --:-- / --:-- -------------------- 🔈-- \`**\n\n**Requested by:** --`
                    }],
                    components: [
                        {
                            type: 1,
                            components: buttons//.map(b => b.disabled = true)
                        },
                        {
                            type: 1,
                            components: buttons2//.map(b => b.disabled = true)
                        },
                        {
                            type: 1,
                            components: buttons3//.map(b => b.disabled = true)
                        },
                    ],
                })
            } else if(!obj) {
                let npendMessage = await msg.reply({
                    content: `**Currently Playing in** \`${msg.channel.guild.name}\``,
                    embeds: [{
                        title: `**Now Playing**`,
                        description: `**__Nothing is playing!__**\n\n**\` ⏹️ --:-- / --:-- -------------------- 🔈-- \`**\n\n**Requested by:** --`
                    }],
                    components: [
                        {
                            type: 1,
                            components: buttons//.map(b => b.disabled = true)
                        },
                        {
                            type: 1,
                            components: buttons2//.map(b => b.disabled = true)
                        },
                        {
                            type: 1,
                            components: buttons3//.map(b => b.disabled = true)
                        },
                    ],
                });
                ctx.music[msg.channel.guild.id].nowPlayingUpdate = {msg: npendMessage, person: null, color: obj && obj.color ? obj.color : null, uniqueId: null};
            } else {
                obj.msg[obj.msg.editOriginal ? `editOriginal` : `edit`]({
                    content: `**Currently Playing in** \`${msg.channel.guild.name}\``,
                    embeds: [{
                        title: `**Now Playing**`,
                        color: obj && obj.color ? obj.color : null,
                        description: `**__Nothing is playing!__**\n\n**\` ⏹️ --:-- / --:-- -------------------- 🔈-- \`**\n\n**Requested by:** --`
                    }],
                    components: [
                        {
                            type: 1,
                            components: buttons//.map(b => b.disabled = true)
                        },
                        {
                            type: 1,
                            components: buttons2//.map(b => b.disabled = true)
                        },
                        {
                            type: 1,
                            components: buttons3//.map(b => b.disabled = true)
                        },
                    ],
                })
            }
        } else {
            if(type == 'edit' || type == 'end') {
                obj = ctx.music[msg.channel.guild.id].nowPlayingUpdate;
                if(!obj) {
                    console.d(`[nowPlayingFunc] THERE IS NO CURRENT OBJ, USING SOURCE MSG`);
                    obj = { msg }
                }
            } else {
                let person = np[3];
                try {
                    let a = msg.channel.guild.members.get(person);
                    person = a.username + `#` + a.discriminator
                } catch(e) {
                    person = `\`{ ${np[3]} }\``
                }
                obj = {
                    person,
                    color: ctx.utils.colors('random'),
                    uniqueId: ctx.music[msg.channel.guild.id].uniqueId
                }
            }; if(type == 'end') {
                if(obj && obj.msg) {
                    obj.color = ctx.utils.colors('random'); 
                    return obj.msg[obj.msg.editOriginal ? `editOriginal` : `edit`]({
                        content: `**Currently Playing in** \`${msg.channel.guild.name}\``,
                        embeds: [{
                            title: `**Now Playing**`,
                            color: obj.color,
                            description: `**__Nothing is playing!__**\n\n**\` ⏹️ --:-- / --:-- -------------------- 🔈-- \`**\n\n**Requested by:** --`
                        }]
                    })
                }
            } else {
                const date = (ctx.music[msg.channel.guild.id].paused && ctx.music[msg.channel.guild.id].paused.time ? ctx.music[msg.channel.guild.id].paused.time : Date.now())
                if(ctx.music[msg.channel.guild.id].uniqueId !== obj.uniqueId) {
                    obj.color = ctx.utils.colors('random'); 
                    obj.uniqueId = ctx.music[msg.channel.guild.id].uniqueId
                }; {
                    let person = obj.person;
                    if(!person) {
                        person = np[3];
                        try {
                            let a = msg.channel.guild.members.get(person);
                            person = a.username + `#` + a.discriminator
                        } catch(e) {
                            person = `\`{ ${np[3]} }\``
                        }; obj.person = person;
                    }
                    let pins = '';
                    if(ctx.music[msg.channel.guild.id].loop === true && ctx.music[msg.channel.guild.id].singleLoop === false) {pins = pins + `🔁`}
                    if(ctx.music[msg.channel.guild.id].singleLoop === true) {pins = pins + `🔂`}

                    let progbar = `--------------------`.split('');

                    let seek = Math.floor(((date-ctx.music[msg.channel.guild.id].startedTime)/(ctx.music[msg.channel.guild.id].nowPlayingEnd-ctx.music[msg.channel.guild.id].startedTime))*100)+((1/20)*100)
                    let playpause = ctx.music[msg.channel.guild.id].paused === false ? `▶️` : `⏸`;
                    let timeRemaining = `${ctx.utils.timestampConvert(date-ctx.music[msg.channel.guild.id].startedTime)} / ${ctx.utils.timestampConvert(ctx.music[msg.channel.guild.id].nowPlayingEnd - ctx.music[msg.channel.guild.id].startedTime)}`;
                    let volicon = `🔈`
                    let vol = `--`;
                    if(ctx.music[msg.channel.guild.id].audioResource && ctx.music[msg.channel.guild.id].audioResource.volume && ctx.music[msg.channel.guild.id].audioResource.volume.volume) vol = ((ctx.music[msg.channel.guild.id].audioResource.volume.volume*100))
                    if(vol && (vol >= 50)) {
                        volicon = `🔉`
                    }
                    if(vol && (vol >= 100)) {
                        volicon = `🔊`
                    }
                    if(ctx.music[msg.channel.guild.id].loadingNext === true) {
                        timeRemaining = `--:-- / ${ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && typeof ctx.music[msg.channel.guild.id].queue[0][1] == `object` ? `${ctx.music[msg.channel.guild.id].queue[0][1][1] || ctx.music[msg.channel.guild.id].queue[0][1][0]}` : `--:--`}`;
                        playpause = `🔄`;
                        buttons[1].disabled = true;
                    } else {
                        //if(typeof np[1] == 'object' && np[1].length === 2) {
                        //    let amt = Math.round((Math.round((Number(np[1][0]) / Number(np[1][1]))*100))/5);
                        //    progbar = (`=`.repeat(amt) + `-`.repeat(20 - amt)).split('')
                        //} else {progbar = `====================`.split('')}
                        progbar = `====================`.split('')
                        
                        if(!np.waveform) {
                            np.waveform = [3,4,6,8,6,4,3,2,3,4,6,8,6,4,3].map(n => (n/8)*100)
                            require('superagent').get(`${ctx.musicApi.location}waveform/${np[2]}`).set(`auth`, ctx.musicApi.key).then(r => r.body).then(r => {
                                if(r && r.data) {
                                    //console.log(`MusicAPI gave waveform response!`, r)
                                    np.waveform = r.data;
                                } else console.error(r)
                            }).catch(console.error)
                        }

                        if(np.waveform && typeof np.waveform == `object`) {
                            progbar = np.waveform.map(o => {
                                // https://en.wikipedia.org/wiki/Block_Elements
                                const values = [
                                    `\u2581`,
                                    `\u2581`,
                                    `\u2582`,
                                    `\u2583`,
                                    `\u2585`,
                                    `\u2585`,
                                    `\u2586`,
                                    `\u2587`,
                                    `\u2587`
                                ]
    
                                let val = Math.floor((o/100)*values.length);
                            
                                //console.log(`Val of ${o} [before]: ${val}`);

                                if(val > values.length-1) val = values.length-1;
                                if(val < 0) val = 0;
                            
                                //console.log(`Val of ${o}: ${val}`);
    
                                return values[val]// || val < 0 ? values[0] : values.slice(-1)[0]
                            });

                            console.d(`New progressbar: [${progbar.join(``)}]`)
                        }

                        progbar.splice(Math.round(seek/5)-1, 1, `🔘`)
                    }
                    let source = np[6].toLowerCase();
                    let sourcepin = source && typeof source == `string` && ctx[source.toLowerCase()] ? ctx[source.toLowerCase()] : ctx.link;
                    let color = obj.color;
                    let upnext = null;
                    let addthumbnail = true;
                    const timeLeft = ctx.music[msg.channel.guild.id].nowPlayingEnd - date;
                    let processedTimeLeft = await ctx.utils.timeConvert(timeLeft)
                    //if(timeLeft <= 20000 && ctx.music[msg.channel.guild.id].queue[1] && ctx.music[msg.channel.guild.id].singleLoop == false) {
                    //    upnext = `> **Up next:** ${ctx[ctx.music[msg.channel.guild.id].queue[1][6].toLowerCase()]} ${ctx.music[msg.channel.guild.id].queue[1][0]} \`[${(await ctx.utils.timestampConvert(ctx.music[msg.channel.guild.id].queue[1][1][0]))}]\` in ${(await ctx.utils.timeConvert(timeLeft))}`
                    //};
                    let volSpace = ``;
                    if(`${vol}`.length === 2) volSpace = ` `;
                    if(`${vol}`.length === 1) volSpace = `  `;
                    if(`${vol}`.length === 0) volSpace = `   `;

                    let bar = `${pins}${playpause} ${timeRemaining} ${progbar.join('')} ${volicon}${vol ? vol + volSpace : `-- `}`

                    const nightcoreEnabled = ctx.music[msg.channel.guild.id].eq.samplemult == 1.15 ? true : false;

                    let quality = `${ctx.music[msg.channel.guild.id].connection.bitrate/1000}kbps`, qualitySecondary = `the highest discord goes!`;

                    if(np.quality) {
                        if(np.quality.maxStreamableBitrate > ctx.music[msg.channel.guild.id].connection.bitrate/1000) {
                            qualitySecondary = `streamable at up to ${np.quality.maxStreamableBitrate}kbps`
                        } else if(np.quality.maxStreamableBitrate < ctx.music[msg.channel.guild.id].connection.bitrate/1000) {
                            quality = `${np.quality.maxStreamableBitrate}kbps`;
                            qualitySecondary = `this track's bitrate`
                        };

                        if(np.quality.maxStreamableBitrate != np.quality.bitrate) {
                            if(qualitySecondary) {
                                qualitySecondary += `, original song @ ${np.quality.bitrate}kbps`
                            } else {
                                qualitySecondary = `original song @ ${np.quality.bitrate}kbps`
                            }
                        }
                    }

                    let embed = {
                        title: `**Now Playing**`,
                        color,
                        description: `[**__${np[0]}__**](${np[2]}) **[${sourcepin}]**\n\n**\` ${bar} \`**\n\n${np[1][0] == null ? `**NOTE:** Playing livestreams with Nyx is in alpha! Please understand that this may not be completely stable.\n\nIf any issues occur, such as the music stopping abruptly, please restart the song using \`/restart\`!\n\n` : ``}${nightcoreEnabled ? `**Nightcore Enabled**\n\n` : ``}${upnext || `**Requested by:** ${person}${np[9] && np[9].name ? ` from ${np[9].type} [**__${np[9].name}__**](${np[9].url})` : ``}`}`,
                        footer: ctx.music[msg.channel.guild.id].queue[1] && timeLeft <= 20000 && processedTimeLeft ? {
                            icon_url: ctx.music[msg.channel.guild.id].queue[1][4] || `https://i.nyx.bot/null.png`,
                            text: `Up next in ${processedTimeLeft}: ${ctx.music[msg.channel.guild.id].queue[1][0]}`
                        } : quality ? {
                            text: `~ ${quality} ${qualitySecondary ? `(${qualitySecondary})` : ``}`
                        } : {},
                    };
                    if(ctx.music[msg.channel.guild.id].thumbnailCaughtUpID !== np[7] && np[4]) {
                        if(np[1][0] > 25000) setTimeout((UID) => {
                            if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].uniqueId == UID) ctx.music[msg.channel.guild.id].thumbnailCaughtUpID = np[7]
                        }, 20000, ctx.music[msg.channel.guild.id].uniqueId);
                        embed.thumbnail = {url: np[4]}
                    } else if(addthumbnail) {embed.thumbnail = {url: np[4]}}

                    const em = {
                        content: `**Currently Playing in** \`${msg.channel.guild.name}\``, 
                        embed,
                        components: [
                            {
                                type: 1,
                                components: buttons
                            },
                            {
                                type: 1,
                                components: buttons2
                            },
                            {
                                type: 1,
                                components: buttons3
                            },
                        ],
                    };

                    if(type == 'edit' && obj.msg) {
                        const actuallyUpdate = () => obj.msg[obj.msg.editOriginal ? `editOriginal` : `edit`](em).catch(e => {
                            if(`${e}`.includes('Unknown Message')) {
                                delete ctx.music[msg.channel.guild.id].nowPlayingUpdate
                            }
                        });

                        const n = JSON.stringify(em);

                        if(obj.lastembd) {
                            const old = obj.lastembd;
                            if(old != n) {
                                actuallyUpdate();
                            };
                        } else actuallyUpdate();

                        obj.lastembd = n;
                        ctx.music[msg.channel.guild.id].nowPlayingUpdate = obj;
                    } else {
                        let npendMessage = await msg.reply(em);
                        ctx.music[msg.channel.guild.id].nowPlayingUpdate = {msg: npendMessage, person, color, uniqueId: ctx.music[msg.channel.guild.id].uniqueId};
                    }
                }
            }
        }
    }
}

async function queueFunc(ctx, msg, type) {    
    if(ctx.music[msg.channel.guild.id]) {
        args = msg.args || []
        if(type == `quit`) {
            if(ctx.music[msg.channel.guild.id].queueUpdate) {
                ctx.music[msg.channel.guild.id].queueUpdate.msg.edit({
                    content: `**Current queue in** \`${msg.channel.guild.name}\``,
                    embeds: [{
                        title: `Queue [0]`,
                        description: `> :stop_button: **The queue has ended!** [00:00]\n> - Requested by: --\n\n**Up Next:**\nPage 1 / 1`,
                        footer: {
                            text: `[00:00] total in the queue`
                        },
                        color: ctx.music[msg.channel.guild.id].queueUpdate.color
                    }]
                })
            };
        } else {
            const entriesPerPage = 8
            let page = 1, totalpages = (Math.floor((( ctx.music[msg.channel.guild.id].queue.length - 2 ) / entriesPerPage) + 1 ) || 1)
            if(!isNaN(args[0]) && Math.round(args[0]) >= 1 && Math.round(args[0]) <= totalpages) {page = Math.round(args[0])}
            let start = (page*entriesPerPage)-entriesPerPage;
            let queuearr = [], np = ctx.music[msg.channel.guild.id].queue[0], queue = ctx.music[msg.channel.guild.id].queue.slice(start+1);
            if(queue.length > entriesPerPage) {queue.length = entriesPerPage}
            queuearr = queue.map(obj => [`${ctx[obj[6].toLowerCase() || `file`] || ctx.file} [**__${ctx.utils.escapeDiscordsFuckingEditing(obj[0])}__**](${obj[2]}) [${ctx.utils.timestampConvert(obj[1][0] || obj[1]).replace(/\n/g, '\n> ')}]\n> - Requested by: <@${(obj[3]).replace(/\n/g, '\n> ')}>`])
            queuearr.unshift(`${np ? ctx[np[6].toLowerCase() || `file`] : ctx.file} [**__${ctx.utils.escapeDiscordsFuckingEditing(np ? np[0] : `--`)}__**](${np ? np[2] : `https://nyx.bot/`}) [${ctx.utils.timestampConvert(np ? (np[1][0] || np[1]) : 0).replace(/\n/g, '\n> ')}]\n> - Requested by: <@${(np ? np[3] : `--`).replace(/\n/g, '\n> ')}>`)
            while(queuearr.join('\n\n').length > 1975) {queuearr.pop()}

            if((!ctx.music[msg.channel.guild.id].queueUpdate || type == `new`) && type !== `update`) {
                const color = ctx.utils.colors('random')

                let embed = {
                    title: `**Queue [${ctx.music[msg.channel.guild.id].queue.length}]**`,
                    color: ctx.utils.colors('random'),
                    description: `> :arrow_forward: ${queuearr.shift()}\n\n**Up Next:**\nPage ${page} / ${totalpages}\n\n${Object.entries(queuearr).map(song => [`> **[${Number(song[0])+start+1}]** ${song[1]}`]).join('\n\n')}`,
                    footer: {
                        text: `[${(await ctx.utils.timestampConvert(ctx.music[msg.channel.guild.id].queue.reduce((c, b) => c + b[1][0], 0)))}] total in the queue`
                    }
                };

                const m = await msg.reply({
                    content: `**Current queue in** \`${msg.channel.guild.name}\``,
                    embed
                })

                ctx.music[msg.channel.guild.id].queueUpdate = {msg: m, color}

                return embed;
            } else if (ctx.music[msg.channel.guild.id].queueUpdate) {
                const q = ctx.music[msg.channel.guild.id].queueUpdate
                let embed = {
                    title: `**Queue [${ctx.music[msg.channel.guild.id].queue.length}]**`,
                    color: q.color,
                    description: `> :arrow_forward: ${queuearr.shift()}\n\n**Up Next:**\nPage ${page} / ${totalpages}\n\n${Object.entries(queuearr).map(song => [`> **[${Number(song[0])+start+1}]** ${song[1]}`]).join('\n\n')}`,
                    footer: {
                        text: `[${(await ctx.utils.timestampConvert(ctx.music[msg.channel.guild.id].queue.reduce((c, b) => c + b[1][0], 0)))}] total in the queue`
                    }
                };

                q.msg.edit({
                    content: `**Current queue in** \`${msg.channel.guild.name}\``,
                    embed
                })
            }
        }
    }
}
const start = async (ctx, msg, msg2, continueVoiceChannel) => new Promise(async (resolveStart, rejectStart) => {
    let chnl;
    let switching;

    if(!msg.member && msg.author) {
        msg.member = msg.channel.guild.members.get(msg.author.id)
    }

    console.d(`start func ${continueVoiceChannel} ${msg.member.voiceState}`)

    if(continueVoiceChannel) {
        chnl = continueVoiceChannel
    } else if(msg.member.voiceState) {
        chnl = msg.member.voiceState.channelID
    } else {
        if(msg2) {
            return await msg2.edit(`${ctx.fail} You left the channel as I was getting ready!`)
        } else {
            return msg.reply(`${ctx.fail} You left the channel as I was getting ready!`)
        }
    }

    if(!msg.member.voiceState && !continueVoiceChannel) {
    } else {chnl = (continueVoiceChannel || msg.member.voiceState.channelID)};
    ctx.music[msg.channel.guild.id] = {
        lastChannel: msg.channel,
        createdThisFuckingObject: Date.now(),
        loop: false,
        singleLoop: false,
        queue: [],
        onHold: {s: false, since: 0, timer: null},
        noMemberLeaveTimeout: 300000,
        noMemberTimer: null,
        autoPause: false,
        replayAttempt: 0,
        paused: false,
        nowPlayingUpdate: null,
        queueUpdate: null,
        lookingUpTracks: false,
        npUpdateTask: null,
        uniqueId: ctx.utils.randomGen(6),
        loadingNext: false,
        loudVolWarn: false,
        skipCount: {votes: 0},
        eq: {
            bass: 1,
            treble: 0,

        },
        thumbnailCaughtUpID: ``,
        addTrack: (...track) => new Promise(async res => {
            while(track.find(track => typeof track == `object` && track.length == 0)) track.splice(track.findIndex(track => typeof track == `object` && track.length == 0), 1);
            if(!track[0]) return res(null);
            if(!track[6]) track[6] = ctx.link;
            const p = ctx.music[msg.channel.guild.id].queue.length;
            let n = 0;
            track = track[0];
            let firstTrack;
            if(typeof track[0] == `object`) {
                console.d(`INTERNALLY RECOGNIZED AS PLAYLIST`)
                while(track.find(track => !track[7])) track[track.findIndex(track => !track[7])][7] = ctx.utils.randomGen(16)
                firstTrack = track.shift();
                n = (ctx.music[msg.channel.guild.id].queue.push(firstTrack) - 1);
                ctx.music[msg.channel.guild.id].queue.push(...track);
                if(3 > n) ctx.music[msg.channel.guild.id].fetchNextTracks()
            } else {
                console.d(`INTERNALLY RECOGNIZED AS SINGLE`);
                if (!track[7]) track[7] = ctx.utils.randomGen(16)
                firstTrack = track;
                const num = ctx.music[msg.channel.guild.id].queue.push(track)
                n = (num - 1);
                if(3 > n) ctx.music[msg.channel.guild.id].fetchNextTracks()
            };

            if(0 > n) n = 0;

            try {
                //ctx.music[msg.channel.guild.id].fetchTrack(track)
            } catch(e) {}

            if(ctx.music[msg.channel.guild.id].onHold.s) {
                clearTimeout(ctx.music[msg.channel.guild.id].onHold.timer);
                ctx.music[msg.channel.guild.id].onHold = {s: false, since: 0, timer: null};
                ctx.music[msg.channel.guild.id].nextTrack(`first`);
            }; res(n);
        }),
    };
    console.d(`CREATED OBJECT`);

    ctx.music[msg.channel.guild.id].channel = await ctx.bot.getChannel(chnl);
    try {
        ctx.music[msg.channel.guild.id].connection = await ctx.music[msg.channel.guild.id].channel.join({
            channelID: ctx.music[msg.channel.guild.id].channel.id,
            guildID: ctx.music[msg.channel.guild.id].channel.guild.id,
            selfDeaf: false,
            selfMute: false,
            voiceAdapterCreator: ctx.music[msg.channel.guild.id].channel.guild.voiceAdapterCreator
        })
        ctx.core.trackEvents(ctx, ctx.music[msg.channel.guild.id].connection, `music channel connection: ${msg.channel.guild.id}`);
        console.d(`CONNECTION CREATED ON ${msg.channel.guild.id}`);

        ctx.music[msg.channel.guild.id].connection.channel = ctx.music[msg.channel.guild.id].channel;
        console.d(`Added channel object to connection object`)

        ctx.music[msg.channel.guild.id].player = require(`@discordjs/voice`).createAudioPlayer({ debug: true, });
        ctx.music[msg.channel.guild.id].connection.subscribe(ctx.music[msg.channel.guild.id].player);
        ctx.core.trackEvents(ctx, ctx.music[msg.channel.guild.id].player, `music channel player: ${msg.channel.guild.id}`);
        console.d(`PLAYER CREATED ON ${msg.channel.guild.id} AND SUBSCRIBED.`)
    }catch(e){
        delete ctx.music[msg.channel.guild.id];
        if(`${e}`.includes(`permission`)) {
            return rejectStart(`I don't have permission to join`)
        } else return rejectStart(`I wasn't able to join the voice channel!`)
    }

    ctx.music[msg.channel.guild.id].connection.stopPlaying = () => ctx.music[msg.channel.guild.id].player.stop()
    console.d(`Created custom stopPlaying function`)
    
    ctx.music[msg.channel.guild.id].connection.startPlaying = (path, opt) => new Promise(async (res, rej) => {
        console.d(`PLAY CALLED ON ${msg.channel.guild.id}`);
        
        ctx.music[msg.channel.guild.id].player.stop(true);

        if(ctx.music[msg.channel.guild.id].ffmpeg) try {
            ctx.music[msg.channel.guild.id].ffmpeg.stdin.destroy()
            ctx.music[msg.channel.guild.id].ffmpeg.kill(`SIGINT`)
        } catch(e) {}
    
        if(!path && ctx.music[msg.channel.guild.id].queue[0][10]) {
            path = ctx.music[msg.channel.guild.id].queue[0][10]
        }

        if(!path && ctx.music[msg.channel.guild.id].queue[0][2]) {
            path = `${ctx.musicApi.location}stream/${ctx.music[msg.channel.guild.id].queue[0][2]}`
        }

        if(!opt || opt.noTranscode) {
            if(!opt) opt = {};

            ctx.music[msg.channel.guild.id].audioResource = require('@discordjs/voice').createAudioResource(ctx.music[msg.channel.guild.id].ffmpeg.stdout, {
                inlineVolume: false,
                inputType: require(`@discordjs/voice`).StreamType.Arbitrary
            });
            
            ctx.music[msg.channel.guild.id].player.play(ctx.music[msg.channel.guild.id].audioResource);

            res(true)
        } else {
            const ffmpegArgs = opt && opt.encoderArgs ? opt.encoderArgs : []

            if(typeof path == `string` && path.includes(ctx.musicApi.location)) {
                if(`${path}`.includes(`?startTime=`)) path = path.split(`?startTime`)[0]
                if(`${path}`.includes(`&startTime=`)) path = path.split(`&startTime`)[0]
    
                ffmpegArgs.unshift(`-headers`, `authorization: ${ctx.config.musicApi.key}`)
            }
    
            ffmpegArgs.push(`-f`, `opus`);
    
            ffmpegArgs.push(`-b:a`, `${ctx.music[msg.channel.guild.id].connection.bitrate/1000}k` || `128k`)
    
            if(opt.seek) ffmpegArgs.push(`-ss`, opt.seek)
    
            if(typeof path == `string`) {
                if(ffmpegArgs.indexOf(`-headers`) != -1) {
                    ffmpegArgs.splice(ffmpegArgs.indexOf(`-headers`)+2, 0, `-i`, path)
                } else ffmpegArgs.unshift(`-i`, path);
                ffmpegArgs.push(`-`)
            } else {
                ffmpegArgs.unshift(`-i`, `-`);
                ffmpegArgs.push(`pipe:1`)
            }
    
            console.d(`PLAY FUNC (${msg.channel.guild.id}): Spawning FFmpeg with args ${ffmpegArgs.map(s => s.includes(` `) ? `"${s}"` : s).join(` `)}`)
    
            ctx.music[msg.channel.guild.id].ffmpeg = require('child_process').spawn(`ffmpeg`, [`-hide_banner`, ...ffmpegArgs]);
            
            if(typeof path.pipe == `function`) path.pipe(ctx.music[msg.channel.guild.id].ffmpeg.stdin);

            let sentBack = false;
    
            ctx.music[msg.channel.guild.id].ffmpeg.stderr.on(`data`, d => {
                const log = d.toString().trim()
                //console.log(log)

                if(log.includes(`size=`)) {
                    const size = Number(log.split(`size=`)[1].match(/\d+/)[0]), time = log.split(`time=`)[1].trim().split(/(\s+)/)[0]
                    console.d(`-- PROGRESS (${msg.channel.guild.id} / ${ctx.music[msg.channel.guild.id].queue[0] ? ctx.music[msg.channel.guild.id].queue[0][0] : `-- no data --`}):\n| Size: ${size}kB\n| Time: ${time}`);
                    if(size > 0 && !sentBack) {
                        sentBack = true;
                        res(true);
                    }
                }
    
                if(log.toLowerCase().includes(`invalid data found`)) {
                    ctx.music[msg.channel.guild.id].ffmpeg.kill(`SIGINT`);
                    rej(new Error(log))
                }
            })
    
            ctx.music[msg.channel.guild.id].audioResource = require('@discordjs/voice').createAudioResource(ctx.music[msg.channel.guild.id].ffmpeg.stdout, {
                inlineVolume: opt && typeof opt.inlineVolume != `undefined` ? opt.inlineVolume : false,
                inputType: require(`@discordjs/voice`).StreamType.Arbitrary
            });
    
            /*ctx.music[msg.channel.guild.id].ffmpeg.stdout.once(`data`, () => {
                ctx.music[msg.channel.guild.id].ffmpeg.stdout.once(`data`, () => {
                    ctx.music[msg.channel.guild.id].ffmpeg.stdout.once(`data`, () => {
                        // once three parts of data has been piped, resolve as successful. gives headroom for ffmpeg to error without resolving as "successful"
                        res(true)
                    });
                });
            });*/
    
            ctx.music[msg.channel.guild.id].ffmpeg.on(`error`, e => {
                if(!sentBack) {
                    sentBack = true;
                    rej(e)
                }
            })
    
            return ctx.music[msg.channel.guild.id].player.play(ctx.music[msg.channel.guild.id].audioResource)
        }
    });
    console.d(`HIJACKED THE PLAY FUNCTION`)

    let intentionalEnd = false, handledError = false
    ctx.music[msg.channel.guild.id].connection.on('customEndBullshit', async (np) => {
        await ctx.timeout(20);
        if(!intentionalEnd && !handledError) {
            let endDate = ctx.music[msg.channel.guild.id].nowPlayingEnd;
            let timeDiff = Math.round((Date.now()-endDate)/1000)
            if(-2 > timeDiff) console.w(`SONG PREMATURELY ENDED [${timeDiff} second offset]\n┃ SONG NAME: ${np[0]}\n┃ SOURCE: ${np[6].toUpperCase()}\n┃ URL: ${np[2]}`)
            if(2 < timeDiff) console.w(`SONG ENDED LATE [${timeDiff} second offset]\n┃ SONG NAME: ${np[0]}\n┃ SOURCE: ${np[6].toUpperCase()}\n┃ URL: ${np[2]}`)
        }
    });
    console.d(`[${msg.channel.guild.id}] CREATED END EVENT LISTENER`)
    ctx.music[msg.channel.guild.id].connection.on('nowPlayingANewTrack', (np) => {
        const time = (np[1][0])
        ctx.music[msg.channel.guild.id].nowPlayingEnd = Number(time/(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].eq && ctx.music[msg.channel.guild.id].eq.samplemult ? ctx.music[msg.channel.guild.id].eq.samplemult : 1))+Date.now()
        ctx.music[msg.channel.guild.id].startedTime = Date.now()
        ctx.music[msg.channel.guild.id].timeInMs = Number(time/(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].eq && ctx.music[msg.channel.guild.id].eq.samplemult ? ctx.music[msg.channel.guild.id].eq.samplemult : 1))+Date.now() - Date.now();
        ctx.music[msg.channel.guild.id].createTimeEnd()
    });
    console.d(`[${msg.channel.guild.id}] CREATED NEW TRACK EVENT LISTENER`)
    ctx.music[msg.channel.guild.id].connection.on('error', async(err) => {
        console.err(err)
        console.debugLog(err)
        const e = (`${err}`).toLowerCase()
        if(e.includes(`cannot call write`) || e.includes(`unable to encode source`) || e.includes(`already encoding`)) {} else {
            if(e.includes('disconnected')) {
                console.d(`BOT WAS DISCONNECTED, CAUGHT FROM CONNECTION EMITTER`, e)
                handledError = true;
                ctx.music[msg.channel.guild.id].botDisconnected = true;
                ctx.music[msg.channel.guild.id].end(1)
                await ctx.timeout(350);
                handledError = false;
            } else if(e.includes(`invalid data found`)) {
                handledError = true;
                ctx.music[msg.channel.guild.id].nextTrack(`forceskip`, undefined, true)
                await ctx.timeout(350);
                handledError = false;
            } else if(e.toLowerCase().includes(`aborted`)) {
                // i mean do nothing, thats supposed to happen...right?
            } else {msg.reply(`${ctx.fail} I was unable to finish the previous song!\n${ctx.utils.parseMusicError(ctx, `yt`, e)}`); ctx.music[msg.channel.guild.id].nextTrack('forceskip');}
        }
    });

    ctx.music[msg.channel.guild.id].forceUpdateNowPlaying = (createTimer, m) => {
        if(ctx.music[msg.channel.guild.id].npUpdateTask && ctx.music[msg.channel.guild.id].nowPlayingUpdate && ctx.music[msg.channel.guild.id].nowPlayingUpdate.msg) {
            console.d(`[forceUpdateNowPlaying] updating nowplaying...`)
            clearInterval(ctx.music[msg.channel.guild.id].npUpdateTask);
            if(createTimer) {
                ctx.cmds.get(`nowplaying`).func(ctx, m ? m : msg, [], m ? false : true)
                console.d(`[forceUpdateNowPlaying] creating new timer`)
            } else {
                ctx.cmds.get(`nowplaying`).func(ctx, m ? m : msg, [], m ? false : true, true)
                console.d(`[forceUpdateNowPlaying] not creating new timer`)
            }
        } else console.d(`[forceUpdateNowPlaying] not acknowledging request; there is no current function / timer!`)
    }

    console.d(`[${msg.channel.guild.id}] CREATED ERROR EVENT LISTENER`)
    ctx.music[msg.channel.guild.id].pause = () => new Promise(async (res, rej) => {
        ctx.music[msg.channel.guild.id].paused = { time: Date.now() }

        if(ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && ctx.music[msg.channel.guild.id].queue[0][1][0] == null) {
            ctx.music[msg.channel.guild.id].connection.stopPlaying();
            ctx.music[msg.channel.guild.id].forceUpdateNowPlaying(false)
            if(ctx.music[msg.channel.guild.id].queue[0].stream) try {
                ctx.music[msg.channel.guild.id].queue[0].stream.destroy()
            } catch(e) {};
            if(ctx.music[msg.channel.guild.id].queue[0].stream) try {
                ctx.music[msg.channel.guild.id].queue[0].stream.socket._httpMessage.end()
                ctx.music[msg.channel.guild.id].queue[0].stream.socket._httpMessage.destroy()
            } catch(e) {};
            if(ctx.music[msg.channel.guild.id].queue[0].stream) try {
                ctx.music[msg.channel.guild.id].queue[0].stream.req.socket._httpMessage.end()
                ctx.music[msg.channel.guild.id].queue[0].stream.req.socket._httpMessage.destroy()
            } catch(e) {};
            if(ctx.music[msg.channel.guild.id].queue[0].passthru) try {
                ctx.music[msg.channel.guild.id].queue[0].passthru.destroy()
            } catch(e) {}
            res()
        } else {
            ctx.music[msg.channel.guild.id].player.pause();
            ctx.music[msg.channel.guild.id].forceUpdateNowPlaying(false)
            ctx.music[msg.channel.guild.id].removeTimeEnd()
            res()
        }
    });
    ctx.music[msg.channel.guild.id].resume = () => new Promise(async (res, rej) => {
        ctx.music[msg.channel.guild.id].autoPause = false;
        if(ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && ctx.music[msg.channel.guild.id].queue[0][1][0] == null) {
            ctx.music[msg.channel.guild.id].paused = false;
            ctx.music[msg.channel.guild.id].forceUpdateNowPlaying(true)
            console.log(`Restarting livestream`)
            ctx.music[msg.channel.guild.id].nextTrack(`first`);
            res()
        } else {
            console.log(`Resuming regular song`)
            let b4playend = ctx.music[msg.channel.guild.id].nowPlayingEnd;
            console.d(`Previously ending at ${b4playend} -- time`, ctx.music[msg.channel.guild.id].paused)
            let timediff = Date.now() - Number(ctx.music[msg.channel.guild.id].paused.time);
            ctx.music[msg.channel.guild.id].nowPlayingEnd = b4playend + timediff
            console.d(`Now ending at ${ctx.music[msg.channel.guild.id].nowPlayingEnd}`)
            ctx.music[msg.channel.guild.id].paused = false;
            ctx.music[msg.channel.guild.id].startedTime = ctx.music[msg.channel.guild.id].startedTime + timediff
            ctx.music[msg.channel.guild.id].player.unpause()
            ctx.music[msg.channel.guild.id].createTimeEnd()
            ctx.music[msg.channel.guild.id].forceUpdateNowPlaying(true)
            res()
        }
    });
    ctx.music[msg.channel.guild.id].refreshEq = () => new Promise(async (res, rej) => {
        const seconds = ((ctx.music[msg.channel.guild.id].paused && ctx.music[msg.channel.guild.id].paused.time ? ctx.music[msg.channel.guild.id].paused.time : Date.now()) % 1000) + 1000;
        const date = (ctx.music[msg.channel.guild.id].paused && ctx.music[msg.channel.guild.id].paused.time ? ctx.music[msg.channel.guild.id].paused.time : Date.now()) + seconds
        const seekTo = date-ctx.music[msg.channel.guild.id].startedTime;
        const timeDue = Date.now() + seconds;
        time = ctx.utils.timestampConvert(seekTo);

        console.d(`seeking to ${time}`);
        console.d(`due in ${(timeDue - Date.now())/1000}s`)

        if(seekTo < Number(ctx.music[msg.channel.guild.id].queue[0][1][0]) + 15000) {
            //let streamResponse;

            /*const streamIt = async stream => {
                let useNCEffects = ctx.music[msg.channel.guild.id].eq && ctx.music[msg.channel.guild.id].eq.next && ctx.music[msg.channel.guild.id].eq.next.samplemult != ctx.music[msg.channel.guild.id].eq.samplemult

                if(ctx.music[msg.channel.guild.id].eq.next) {ctx.music[msg.channel.guild.id].eq = ctx.music[msg.channel.guild.id].eq.next; delete ctx.music[msg.channel.guild.id].eq.next}

                if(!ctx.music[msg.channel.guild.id].paused) {
                    ctx.music[msg.channel.guild.id].removeTimeEnd()
                };
                ctx.music[msg.channel.guild.id].connection.stopPlaying();

                //if(stream) ctx.music[msg.channel.guild.id].queue[0].stream = stream;
                await ctx.music[msg.channel.guild.id].connection.startPlaying(null, Object.assign(STANDARDPLAYARGS(ctx.music[msg.channel.guild.id].queue[0][1][0] == null ? Object.assign({}, ctx.music[msg.channel.guild.id].eq, {samplemult: undefined}) : ctx.music[msg.channel.guild.id].eq), {
                    seek: time,
                    passive: true,
                }))

                ctx.music[msg.channel.guild.id].autoPause = false;
                ctx.music[msg.channel.guild.id].nowPlayingEnd = Date.now() + ctx.music[msg.channel.guild.id].timeInMs/(useNCEffects ? (ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].eq && ctx.music[msg.channel.guild.id].eq.samplemult ? ctx.music[msg.channel.guild.id].eq.samplemult : 1) : 1) - (ctx.utils.timestampStringToNum(time))
                ctx.music[msg.channel.guild.id].startedTime = Date.now() - ctx.utils.timestampStringToNum(time)
                ctx.music[msg.channel.guild.id].paused = false;
                ctx.music[msg.channel.guild.id].createTimeEnd()
                res()
            }*/

            const streamIt = () => ctx.music[msg.channel.guild.id].seek(time)

            setTimeout(() => streamIt(null), timeDue - Date.now())

            /*getStream(ctx, ctx.music[msg.channel.guild.id].queue[0], true, true, msg, false, time).then(stream => {
                streamResponse = true;
                setTimeout(() => streamIt(stream), timeDue - Date.now())
            }).catch(e => {
                console.error(`${e}`);
                getStream(ctx, ctx.music[msg.channel.guild.id].queue[0], true, true, msg, false, time).then(stream => {
                    streamResponse = true;
                    setTimeout(() => streamIt(stream), timeDue - Date.now())
                }).catch(e => {
                    console.error(`${e}`);
                })
            });

            setTimeout(() => {
                if(!streamResponse) {
                    ctx.music[msg.channel.guild.id].pause();
                }
            }, 8000)*/
        } else res(null)
    })
    ctx.music[msg.channel.guild.id].seek = (time) => new Promise(async (res, rej) => {
        if(!time) {
            const date = (ctx.music[msg.channel.guild.id].paused && ctx.music[msg.channel.guild.id].paused.time ? ctx.music[msg.channel.guild.id].paused.time : Date.now()) + 5000
            time = ctx.utils.timestampConvert(date-ctx.music[msg.channel.guild.id].startedTime);
        };
        console.d(`seeking at ${time}`);

        //await ctx.music[msg.channel.guild.id].pause()
        ctx.music[msg.channel.guild.id].loadingNext = true;
        ctx.music[msg.channel.guild.id].player.pause()
        ctx.music[msg.channel.guild.id].forceUpdateNowPlaying(false)

        if(!ctx.music[msg.channel.guild.id].paused) {
            ctx.music[msg.channel.guild.id].removeTimeEnd()
        };

        await ctx.music[msg.channel.guild.id].connection.startPlaying(null, Object.assign(STANDARDPLAYARGS(ctx.music[msg.channel.guild.id].queue[0][1][0] == null ? Object.assign({}, ctx.music[msg.channel.guild.id].eq, {samplemult: undefined}) : ctx.music[msg.channel.guild.id].eq), {
            seek: time,
        }))

        ctx.music[msg.channel.guild.id].autoPause = false;
        ctx.music[msg.channel.guild.id].nowPlayingEnd = Date.now() + ctx.music[msg.channel.guild.id].timeInMs - (ctx.utils.timestampStringToNum(time))
        ctx.music[msg.channel.guild.id].startedTime = Date.now() - ctx.utils.timestampStringToNum(time)
        ctx.music[msg.channel.guild.id].paused = false;
        //if(stream) ctx.music[msg.channel.guild.id].queue[0].stream = stream;
        ctx.music[msg.channel.guild.id].createTimeEnd()
        ctx.music[msg.channel.guild.id].loadingNext = false;
        ctx.music[msg.channel.guild.id].forceUpdateNowPlaying(true)
        res()
    })
    ctx.music[msg.channel.guild.id].createTimeEnd = async () => {
        const np = ctx.music[msg.channel.guild.id].queue[0];
        if(np[1][0] == null) {
            console.debug(`NO END FOUND, JUST GONNA WAIT FOR CONNECTION TO EMIT END`);

            let ran = false;
            const restart = async (from) => {
                if(!ran && np[7] == ctx.music[msg.channel.guild.id].queue[0][7]) {
                    if(np.stream) try {
                        np.stream.destroy()
                    } catch(e) {};
                    if(np.stream) try {
                        np.stream.socket._httpMessage.end()
                        np.stream.socket._httpMessage.destroy()
                    } catch(e) {};
                    if(np.stream) try {
                        np.stream.req.socket._httpMessage.end()
                        np.stream.req.socket._httpMessage.destroy()
                    } catch(e) {};
                    if(np.passthru) try {
                        np.passthru.destroy()
                    } catch(e) {}

                    ran = true;
                    console.debug(`stream end found! (called from ${from}) restarting stream`)
                    //ctx.music[msg.channel.guild.id].connection.emit('customEndBullshit', ctx.music[msg.channel.guild.id].queue.slice(0)[0])

                    //await new Promise(r => setTimeout(r, 1000))
                    return ctx.music[msg.channel.guild.id].nextTrack(`first`)
                }
            }

            if(np.stream) np.stream.once(`error`, () => restart(`stream-error`))
            //if(np.stream) np.stream.once(`aborted`, () => restart(`stream-aborted`))
            //if(np.stream) np.stream.once(`close`, () => restart(`stream-close`))
            if(np.passthru) np.passthru.once(`error`, () => restart(`passthru-error`))
            //if(np.passthru) np.passthru.once(`close`, () => restart(`passthru-close`))

            ctx.music[msg.channel.guild.id].connection.once(`error`, () => restart(`error`))
            //ctx.music[msg.channel.guild.id].connection.once(`end`, () => restart(`end`))
        } else {
            const time = ctx.music[msg.channel.guild.id].nowPlayingEnd - Date.now()
            ctx.music[msg.channel.guild.id].endTimeout = setTimeout(() => {
                ctx.music[msg.channel.guild.id].connection.emit('customEndBullshit', ctx.music[msg.channel.guild.id].queue.slice(0)[0])
                return ctx.music[msg.channel.guild.id].nextTrack()
            }, time); if(time - 20000 > 30000) {
                ctx.music[msg.channel.guild.id].fetchTrack(ctx.music[msg.channel.guild.id].queue[1])
            } else {
                ctx.music[msg.channel.guild.id].searchNextTrackTimeout = setTimeout(() => ctx.music[msg.channel.guild.id].fetchTrack(ctx.music[msg.channel.guild.id].queue[1]), time-20000)
            }
            const actualTime = await ctx.utils.timeConvert(time);
            console.debugLog(`song finishes in ${actualTime}.`)
        }
    }
    ctx.music[msg.channel.guild.id].removeTimeEnd = () => {
        try {
            clearTimeout(ctx.music[msg.channel.guild.id].endTimeout); 
            delete ctx.music[msg.channel.guild.id].endTimeout;
            clearTimeout(ctx.music[msg.channel.guild.id].searchNextTrackTimeout); 
            return delete ctx.music[msg.channel.guild.id].searchNextTrackTimeout;
        } catch(e) {}
    }
    console.d(`[${msg.channel.guild.id}] CREATED PAUSE & RESUME FUNCTIONS`)
    ctx.music[msg.channel.guild.id].hold = (arg) => new Promise(async (res, rej) => {
        ctx.music[msg.channel.guild.id].queue = [];
        ctx.music[msg.channel.guild.id].onHold.s = true;
        const now = Date.now()
        ctx.music[msg.channel.guild.id].onHold.since = now;
        ctx.music[msg.channel.guild.id].onHold.timer = setTimeout((UID) => {
            if(ctx.music[msg.channel.guild.id].onHold.since == now && ctx.music[msg.channel.guild.id].uniqueId == UID) {
                ctx.music[msg.channel.guild.id].end(69);
            }
        }, 600000, ctx.music[msg.channel.guild.id].uniqueId);
        res(true);
        if(msg.channel.guild.guildSetting && msg.channel.guild.guildSetting.musicChime === true) {
            if(arg == `skip` || arg == `skipto`) {
                //ctx.music[msg.channel.guild.id].tempVol = ctx.music[msg.channel.guild.id].connection.volume
                //ctx.music[msg.channel.guild.id].connection.setVolume(0.50)
                await ctx.music[msg.channel.guild.id].connection.startPlaying(`./res/sound-effects/music/skip.wav`, STANDARDPLAYARGS())
            } else if(arg == `forceskip`) {
                waitForTone = true;
                //ctx.music[msg.channel.guild.id].tempVol = ctx.music[msg.channel.guild.id].connection.volume
                //ctx.music[msg.channel.guild.id].connection.setVolume(0.50)
                await ctx.music[msg.channel.guild.id].connection.startPlaying(`./res/sound-effects/music/err.wav`, STANDARDPLAYARGS())
            }
        }
    });
    console.d(`[${msg.channel.guild.id}] CREATED HOLD FUNCTION`)
    ctx.music[msg.channel.guild.id].end = (arg, channel, doNotLeave) => new Promise(async (resolve, rej) => {
        console.d(`END CALLED FROM ${new Error().stack}`);
        let endMessage;
        if(ctx.music[msg.channel.guild.id] && !ctx.music[msg.channel.guild.id].finalEndCalled) try {
            if (ctx.bot.voiceConnections.get(msg.channel.guild.id)) ctx.bot.voiceConnections.get(msg.channel.guild.id).stopPlaying();
            ctx.music[msg.channel.guild.id].finalEndCalled = true;

            // CLEAR ALL THINGS
            if(ctx.music[msg.channel.guild.id].onHold.timer) clearTimeout(ctx.music[msg.channel.guild.id].onHold.timer)

            ctx.music[msg.channel.guild.id].finalEndCalled = true;
            endCalled = true;
            let completelyDonePlaying = null;
            const playTone = async () => {
                if(!doNotLeave) try {
                    if(!ctx.bot.voiceConnections.get(msg.channel.guild.id)) {
                        completelyDonePlaying = true;
                        ctx.music[msg.channel.guild.id].eventEmitter.emit(`justDisconnect`)
                    } else {
                        completelyDonePlaying = false;
                        if(ctx.music[msg.channel.guild.id].createdThisFuckingObject + 15000 < Date.now() /* if the queue has lasted longer than 15 seconds, do this */) {
                            await ctx.timeout(225);
                            //ctx.music[msg.channel.guild.id].tempVol = ctx.bot.voiceConnections.get(msg.channel.guild.id).volume;
                            try {
                                intentionalEnd = true;
                                ctx.bot.voiceConnections.get(msg.channel.guild.id).stopPlaying();
                            }catch(e){}
                            //ctx.bot.voiceConnections.get(msg.channel.guild.id).setVolume(0.50)
                            ctx.bot.voiceConnections.get(msg.channel.guild.id).startPlaying(`./res/sound-effects/music/bye.wav`);
                            ctx.timeout(2271).then(() => {
                                completelyDonePlaying = true;
                                ctx.music[msg.channel.guild.id].eventEmitter.emit(`justDisconnect`)
                            })
                        } else {
                            completelyDonePlaying = true;
                            ctx.music[msg.channel.guild.id].eventEmitter.emit(`justDisconnect`)
                        }
                    }
                } catch(e) {console.de(`FAILED AT PLAYING TONE WITH ERR AT ${new Error().stack}`, e)}
            }
            ctx.music[msg.channel.guild.id].forceUpdateNowPlaying(false)
            ctx.music[msg.channel.guild.id].removeTimeEnd()
            if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].nowPlayingUpdate) nowPlayingFunc(ctx, msg, 'end');
            
            let content = {
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 5,
                                url: `https://www.patreon.com/NyxBot`,
                                label: `Support us on Patreon`
                            },
                            {
                                type: 2,
                                style: 5,
                                url: `https://top.gg/bot/600206352916414464`,
                                label: `You can also help us by upvoting Nyx on top.gg!`
                            },
                        ]
                    }
                ],
                embeds: [
                    {
                        author: {
                            name: `We're asking for your help!`,
                            icon_url: `https://s.nyx.bot/assets/images/image03.png`
                        },
                        description: `Nyx was created with the idea that **nothing should be locked behind paywalls**, and we've stuck by our word ever since.\n\nUnfortunately, running Nyx does cost a *decent* amount of money, and keeping our music services alive **singlehandedly takes the most of our** *(rather minimal)* **budget.**\n\nIf you love Nyx and enjoy the services they offer, we kindly ask of you to help us keep running Nyx and adding more cool features by sending us a donation!\n\nBy donating to Nyx (either one time or recurringly through Patreon), you can recieve a cool Supporter badge in your userinfo card (even if you cancel)!`,
                        color: ctx.utils.colors(`random`),
                    }
                ]
            };

            try {
                console.d(`SENDING MESSAGE; arg: ${arg}`)
                if(arg===1){
                    completelyDonePlaying = true;
                    ctx.music[msg.channel.guild.id].eventEmitter.emit(`justDisconnect`)
                    content.content = `<:NyxCry:942164350981009458> I was disconnected, so I cleared the queue for you!`
                    endMessage = await ctx.bot.rest.channels.createMessage(ctx.music[msg.channel.guild.id].lastChannel.id, content)
                } else if(arg===2){
                    if(msg.channel.guild.guildSetting && msg.channel.guild.guildSetting.musicChime === true) playTone()
                    content.content = `<:NyxSing:942164350649663499> My queue has finished!`
                    endMessage = await ctx.bot.rest.channels.createMessage(ctx.music[msg.channel.guild.id].lastChannel.id, content)
                } else if(arg===3){
                    completelyDonePlaying = true;
                    ctx.music[msg.channel.guild.id].eventEmitter.emit(`justDisconnect`)
                    content.content = `<:NyxCry:942164350981009458> I was left alone for a while, so I left the voice channel to help me save resources!\nYou can always start a new queue with the \`play\` command!`
                    endMessage = await ctx.bot.rest.channels.createMessage(ctx.music[msg.channel.guild.id].lastChannel.id, content)
                } else if(arg===4){
                    if(msg.channel.guild.guildSetting && msg.channel.guild.guildSetting.musicChime === true) playTone()
                    content.content = `${ctx.pass} Successfully left the voice channel!`
                    endMessage = await (channel || msg.channel).createMessage(content)
                } else if(arg === 69) {
                    completelyDonePlaying = true;
                    ctx.music[msg.channel.guild.id].eventEmitter.emit(`justDisconnect`)
                    content.content = `${ctx.pass} The queue has been empty for a while now, so I left the voice channel to help me save resources!\nYou can always start a new queue with the \`play\` command!`
                    endMessage = await ctx.bot.rest.channels.createMessage(ctx.music[msg.channel.guild.id].lastChannel.id, content)
                } else if(typeof arg == `string`) {
                    if(msg.channel.guild.guildSetting && msg.channel.guild.guildSetting.musicChime === true) playTone()
                    content.content = arg
                    endMessage = await ctx.bot.rest.channels.createMessage(ctx.music[msg.channel.guild.id].lastChannel.id, content)
                } else if(typeof arg == `object`) {
                    if(msg.channel.guild.guildSetting && msg.channel.guild.guildSetting.musicChime === true) playTone()
                    content.content = `${ctx.pass} Successfully left the voice channel!`
                    endMessage = await arg.reply(content)
                } else {
                    completelyDonePlaying = true;
                    ctx.music[msg.channel.guild.id].eventEmitter.emit(`justDisconnect`)
                };

                console.d(`SENT MESSAGE: ${endMessage.id}`)
            } catch(error) {
                console.de(`FAILED TO SEND LEAVE MESSAGE OR PREREQ OR SMTH IDK HERES ARG ${arg}`, error);
                console.de(`last channel exists: ${ctx.music[msg.channel.guild.id].lastChannel && typeof ctx.music[msg.channel.guild.id].lastChannel == `object`};\nchannel specified: ${channel ? true : false}; arg: ${arg}`)
            }
            playing = false;
            currentTimeEnding = null;
            timeInMsToEnd = null;
            timeWithDate = null;
            nexttrack = null;
            paused = false;
            if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && ctx.music[msg.channel.guild.id].queue[0].stream) try {
                ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && ctx.music[msg.channel.guild.id].queue[0].stream.destroy()
            } catch(e) {};
            if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && ctx.music[msg.channel.guild.id].queue[0].stream) try {
                ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && ctx.music[msg.channel.guild.id].queue[0].stream.socket._httpMessage.end()
                ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && ctx.music[msg.channel.guild.id].queue[0].stream.socket._httpMessage.destroy()
            } catch(e) {};
            if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && ctx.music[msg.channel.guild.id].queue[0].stream) try {
                ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && ctx.music[msg.channel.guild.id].queue[0].stream.req.socket._httpMessage.end()
                ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && ctx.music[msg.channel.guild.id].queue[0].stream.req.socket._httpMessage.destroy()
            } catch(e) {};
            if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && ctx.music[msg.channel.guild.id].queue[0].passthru) try {
                ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && ctx.music[msg.channel.guild.id].queue[0].passthru.destroy()
            } catch(e) {}
            async function finalize() {
                console.d(`FINALIZE FUNCTION CALLED FOR ${msg.channel.guild.id}`)
                if(!doNotLeave && ctx.bot.voiceConnections.get(msg.channel.guild.id) && ctx.bot.voiceConnections.get(msg.channel.guild.id).channel) {
                    console.d(`VOICE CHANNEL EXISTS; LEAVING.`)
                    try {
                        ctx.bot.getChannel(ctx.bot.voiceConnections.get(msg.channel.guild.id).channel.id).leave()
                    } catch(e) {console.de(`failed to leave in finalize function:`, e)}
                }; try {
                    ctx.music[msg.channel.guild.id].eventEmitter.emit(`gone`);
                    const Timeout = setTimeout(()=>{},0).constructor;
                    for(key of Object.keys(ctx.music[msg.channel.guild.id])) {
                        try {
                            if(ctx.music[msg.channel.guild.id][key]) {
                                console.d(`CHECKING IF "${key}" ENTRY IS CLEARABLE...`);
                                if(typeof ctx.music[msg.channel.guild.id][key] == `object` && typeof ctx.music[msg.channel.guild.id][key].removeAllListeners == `function`) {
                                    ctx.music[msg.channel.guild.id][key].removeAllListeners(); delete ctx.music[msg.channel.guild.id][key]
                                    console.d(`CLEARED LISTENERS FOR: ${key}`)
                                } else if(ctx.music[msg.channel.guild.id][key] instanceof Timeout) {
                                    console.d(`CLEARED TIMEOUT FOR: ${key}`)
                                    clearTimeout(ctx.music[msg.channel.guild.id][key]); 
                                    delete ctx.music[msg.channel.guild.id][key];
                                } else if(typeof ctx.music[msg.channel.guild.id][key] == `object`) {
                                    const objsInObj = Object.values(ctx.music[msg.channel.guild.id][key]).filter(o => typeof o[1] == `object`);
                                    if(objsInObj.length > 0) {
                                        console.d(`THERE ARE ${objsInObj.length} EXTRA OBJECTS IN THIS ONE`)
                                        for(i of objsInObj) {
                                            if(i[1] instanceof Timeout) {
                                                console.d(`${i[0]} (ctx.music[${msg.channel.guild.id}].${i[0]}) IS A TIMER/INTERVAL; CLEARING.`)
                                                clearTimeout(ctx.music[msg.channel.guild.id][i[0]]);
                                                delete ctx.music[msg.channel.guild.id][i[0]];
                                            }
                                        }
                                    }
                                }
                            }
                        } catch(e) {}
                    }; delete ctx.music[msg.channel.guild.id]
                } catch(e) {console.de(`FAILED IN DELETING KEYS;`, e)}
                resolve(endMessage);
            }
            if(completelyDonePlaying || completelyDonePlaying === null) {finalize()} else {
                ctx.music[msg.channel.guild.id].eventEmitter.once(`justDisconnect`, finalize);
            }
            if(ctx.music[msg.channel.guild.id]) {
                const UID = ctx.music[msg.channel.guild.id].createdThisFuckingObject.toString()
                setTimeout(() => {
                    if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].createdThisFuckingObject && ctx.music[msg.channel.guild.id].createdThisFuckingObject.toString() == UID) {
                        ctx.music[msg.channel.guild.id].eventEmitter.removeAllListeners();
                        console.d(`THE SERVER ${msg.channel.guild.id} HAS BEEN FORCIBLY EXITED.`)
                        finalize();
                    }
                }, 10000)
            }
        } catch(e) {
            console.de(`FAILED END FUNCTION WITH`, e)
            resolve(endMessage)
            //rej(e)
        }
    });
    console.d(`[${msg.channel.guild.id}] CREATED END FUNCTION`)
    ctx.music[msg.channel.guild.id].eventEmitter = new EventEmitter()
    ctx.core.trackEvents(ctx, ctx.music[msg.channel.guild.id].eventEmitter, `music event emitter: ${msg.channel.guild.id}`)
    console.d(`[${msg.channel.guild.id}] CREATED EVENT EMITTER FOR MUSIC`);
    ctx.music[msg.channel.guild.id].legacyFetchTrack = (track) => new Promise(async res => {
        if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && track) {
            console.d(track)
            const s = `${track[8] ? true : false}-${track[6]}-${track[7]}`; console.d(track, s)
            console.d(`${s}:\n> exists? ${ctx.cache.songLookupResults[s] ? true : false}\n> (spotify only) is ready? ${ctx.music[msg.channel.guild.id].queue.find(o => o[7] == track[7]) && ctx.music[msg.channel.guild.id].queue.find(o => o[0] == track[0])[8] == true ? true : false}`)
            if(track[10] && (typeof track[10] == `function` || typeof track[10] == `string`)) {
                return res(track)
            } else if(typeof ctx.cache.songLookupResults[s] == `object`) {
                console.d(`A PREVIOUS SEARCH HAS BEEN DONE FOR THE SONG ${s}; ${ctx.cache.songLookupResults[s].complete ? `HOWEVER HAS NOT BEEN COMPLETE, SO WE WILL ATTACH A LISTENER` : `THE SEARCH HAS BEEN COMPLETE, SO WE CAN RESOLVE IT NOW.`}`)
                if(!ctx.cache.songLookupResults[s].complete) {
                    let resolved = false;
                    const eventTrigger = song => {
                        resolved = true;
                        if(!song) return ctx.music[msg.channel.guild.id].fetchTrack(track).then(res);
                    }; const l = trackLookupEmitter.once(s, eventTrigger); setTimeout(UID => {
                        if(!resolved && ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].uniqueId == UID) {
                            console.d(`did not resolve within 15 seconds; calling raw fetchtrack!`)
                            trackLookupEmitter.removeListener(s, eventTrigger);
                            delete ctx.cache.songLookupResults[s];
                            ctx.music[msg.channel.guild.id].fetchTrack(track).then(res)
                        }
                    }, 15000, ctx.music[msg.channel.guild.id].uniqueId)
                } else return res(ctx.cache.songLookupResults[s])
            } else {
                if(ctx.music[msg.channel.guild.id].queue.find(o => o[0] == track[0]) && ctx.music[msg.channel.guild.id].queue.find(o => o[0] == track[0])[8] == true) {
                    res(ctx.music[msg.channel.guild.id].queue.find(o => o[0] == track[0]))
                } else {
                    ctx.cache.songLookupResults[s] = {};
                    if(track[6] == `sp` && !track[8]) {
                        console.d(`TRACK REQUESTED FOR LOOKUP; SOURCE IS SPOTIFY.`);
                        const ytResult = await lookupTrack(ctx, msg, track);
                        if(ytResult) {
                            let index = ctx.music[msg.channel.guild.id].queue.findIndex(s => s[7] == track[7]);
                            if(index === -1) index = null;
                            console.d(`RESOLVED SPOTIFY TRACK: ${track[0]}; TRACK INDEX IS ${index !== null ? `AT POS ${index}` : `NOT IN THE QUEUE ANYMORE... :(`}`);
                            if(index !== null) {
                                const v = ytResult
                                ctx.music[msg.channel.guild.id].queue[index][1] = [v.duration];
                                ctx.music[msg.channel.guild.id].queue[index][5] = v.id;
                                ctx.music[msg.channel.guild.id].queue[index][8] = true;
                                //ctx.music[msg.channel.guild.id].fetchTrack(ctx.music[msg.channel.guild.id].queue[index]).then(res).catch(res)
                                // let's try to avoid a call to own function, this caused a lot of issues
                                //copied from yt lookup
                                let info;
                                
                                try {
                                    info = await ctx.libs.ytdl.getInfoForDownloadThing(`${v.id}`);
                                } catch(e) {
                                    console.de(`COULD NOT GET TRACK INFO FOR ${v.id}`, e)
                                }; if(info) {
                                    let index = ctx.music[msg.channel.guild.id].queue.findIndex(s => s[7] == track[7]);
                                    if(index === -1) index = null;
                                    console.d(`RESOLVED YOUTUBE INFO OBJECT: ${track[0]}; TRACK INDEX IS ${index !== null ? `AT POS ${index}` : `NOT IN THE QUEUE ANYMORE... :(`}`);
                                    if(index !== null) {
                                        console.d(`index is valid`)
                                        const v = info
                                        ctx.music[msg.channel.guild.id].queue[index][1] = [(Number(v.videoDetails.lengthSeconds)) * 1000];
                                        ctx.music[msg.channel.guild.id].queue[index][10] = () => ctx.libs.ytdl.download(info, { filter: 'audioonly', quality:'highestaudio' });
                                    } else console.d(`index is invalid`)
                                    
                                    res(info)
                                    trackLookupEmitter.emit(s, info)
                                } else res()
                            } else res(ytResult)
                            trackLookupEmitter.emit(s, ytResult)
                        } else {
                            console.de(`no ytResult available...`, ytResult)
                            let index = ctx.music[msg.channel.guild.id].queue.findIndex(s => s[7] == track[7]);
                            if(index === -1) index = null;
                            console.d(`I WAS UNABLE TO RESOLVE THE SPOTIFY TRACK ${track[0]}; TRACK INDEX IS ${index !== null ? `AT POS ${index}` : `NOT IN THE QUEUE ANYMORE... it was gonna be deleted anyways lol`}`);
                            if(index !== null) ctx.music[msg.channel.guild.id].queue.splice(index, 1);
                            res()
                        }
                    } else if (track[6] == `yt` || (track[6] == `sp` && track[8])) {
                        console.d(`TRACK REQUESTED FOR LOOKUP; SOURCE IS ${track[6] == `yt` ? `YOUTUBE` : `A YOUTUBE RESULT FROM SPOTIFY`}.`);
                        let info;
                        try {
                            info = await ctx.libs.ytdl.getInfoForDownloadThing(`${track[5]}`);
                        } catch(e) {
                            console.de(`COULD NOT GET TRACK INFO FOR ${track[5]}`, e)
                        }; if(info) {
                            let index = ctx.music[msg.channel.guild.id].queue.findIndex(s => s[7] == track[7]);
                            if(index === -1) index = null;
                            console.d(`RESOLVED YOUTUBE INFO OBJECT: ${track[0]}; TRACK INDEX IS ${index !== null ? `AT POS ${index}` : `NOT IN THE QUEUE ANYMORE... :(`}`);
                            if(index !== null) {
                                console.d(`index is valid`)
                                const v = info
                                ctx.music[msg.channel.guild.id].queue[index][1] = [(Number(v.videoDetails.lengthSeconds)) * 1000];
                                ctx.music[msg.channel.guild.id].queue[index][10] = () => ctx.libs.ytdl.download(info, { filter: 'audioonly', quality:'highestaudio' });
                            } else console.d(`index is invalid`)
                            
                            res(info)
                            trackLookupEmitter.emit(s, info)
                        } else res()
                    } else if (track[6] == `sc`) {
                        let index = ctx.music[msg.channel.guild.id].queue.findIndex(s => s[7] == track[7]);
                        console.d(`RESOLVED SOUNDCLOUD PLAY FUNCTION: ${track[0]}; TRACK INDEX IS ${index !== null ? `AT POS ${index}` : `NOT IN THE QUEUE ANYMORE... :(`}`);
                        ctx.music[msg.channel.guild.id].queue[index][10] = () => ctx.libs.scdl.download(track[2]);
                    } else res()
                }
            }
        }
    })
    ctx.music[msg.channel.guild.id].createAlbumArt = (np) => new Promise(async res => {
        if(!np[4].startsWith(`https://cache.nyx.bot/nyxalbumart/`)) {
            console.d(`Creating album art image for "${np[0]}"`)
    
            console.d(`Parsing URL: ${np[4]}`)
    
            ctx.libs.superagent.post(`${ctx.config.musicApi.musicImagesEndpoint}circleIconGenerate`).set(`authorization`, ctx.config.musicApi.key).send({
                url: np[4],
                from: np[2]
            }).then(r => {
                res()
                console.d(`Successfully created album art image for "${np[0]}"; response:`, r.body)
    
                if(!np[4].startsWith(`https://cache.nyx.bot/nyxalbumart/`)) {
                    console.d(`Old image link: ${np[4]}`)
                    console.d(r.body.toString())
                    np[4] = r.body && r.body.url ? r.body.url : `https://i.nyx.bot/null.png`
                    console.d(`New image link: ${np[4]}`)
                }
            }).catch(e => {
                res()
                console.de(e)
            })
        }
    })
    ctx.music[msg.channel.guild.id].fetchTrack = (track) => new Promise(async res => {
        if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && track) {
            const s = `${track[8] ? true : false}-${track[6]}-${track[7]}`;

            require('superagent').get(`${ctx.musicApi.location}getInfo/${track[2]}`).set(`auth`, ctx.musicApi.key).then(async r => {
                let index = ctx.music[msg.channel.guild.id].queue.findIndex(s => s[7] == track[7]);

                console.d(`getInfo returned on ${s} / ${r.body.title}`)

                if(index != -1) {
                    ctx.music[msg.channel.guild.id].queue[index][0] = `${r.body.author.name} - ${r.body.title}`;
                    ctx.music[msg.channel.guild.id].queue[index][1] = r.body.duration ? [r.body.duration.units.ms] : ctx.music[msg.channel.guild.id].queue[index][1]
                    ctx.music[msg.channel.guild.id].queue[index][2] = r.body.url;

                    if(r.body.bitrate) {
                        ctx.music[msg.channel.guild.id].queue[index].quality = {
                            bitrate: r.body.bitrate,
                            maxStreamableBitrate: r.body.streamableBitrate
                        }
                    }

                    console.d(`applied ${s} / ${r.body.title} metadata on index ${index}!`);

                    res(r)
                } else res(r)
            }).catch(e => {
                console.de(e); res(null);
            })
            
            /*if(track[10] && (typeof track[10] == `function` || typeof track[10] == `string`)) {
                return res(track)
            } else if(typeof ctx.cache.songLookupResults[s] == `object`) {
                console.d(`A PREVIOUS SEARCH HAS BEEN DONE FOR THE SONG ${s}; ${ctx.cache.songLookupResults[s].complete ? `HOWEVER HAS NOT BEEN COMPLETE, SO WE WILL ATTACH A LISTENER` : `THE SEARCH HAS BEEN COMPLETE, SO WE CAN RESOLVE IT NOW.`}`)
                if(!ctx.cache.songLookupResults[s].complete) {
                    let resolved = false;
                    const eventTrigger = song => {
                        resolved = true;
                        if(!song) return ctx.music[msg.channel.guild.id].fetchTrack(track).then(res);
                    }; const l = trackLookupEmitter.once(s, eventTrigger); setTimeout(UID => {
                        if(!resolved && ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].uniqueId == UID) {
                            console.d(`did not resolve within 15 seconds; calling raw fetchtrack!`)
                            trackLookupEmitter.removeListener(s, eventTrigger);
                            delete ctx.cache.songLookupResults[s];
                            ctx.music[msg.channel.guild.id].fetchTrack(track).then(res)
                        }
                    }, 15000, ctx.music[msg.channel.guild.id].uniqueId)
                } else return res(ctx.cache.songLookupResults[s])
            } else {
                if(ctx.music[msg.channel.guild.id].queue.find(o => o[0] == track[0]) && ctx.music[msg.channel.guild.id].queue.find(o => o[0] == track[0])[8] == true) {
                    res(ctx.music[msg.channel.guild.id].queue.find(o => o[0] == track[0]))
                } else {
                    ctx.cache.songLookupResults[s] = {};

                    let index = ctx.music[msg.channel.guild.id].queue.findIndex(s => s[7] == track[7]);

                    if(index !== -1) {
                        try {
                            const link = await getStream(ctx, ctx.music[msg.channel.guild.id].queue[index], true, true, msg, true);

                            console.log(`RESOLVED LINK: ${link}`)

                            if(link) {
                                let index = ctx.music[msg.channel.guild.id].queue.findIndex(s => s[7] == track[7]);
                                if(index !== -1) {
                                    ctx.music[msg.channel.guild.id].queue[index][10] = link;
                                }
                                res(ctx.music[msg.channel.guild.id].queue[index]);
                                trackLookupEmitter.emit(s, ctx.music[msg.channel.guild.id].queue[index])
                            }
                        } catch(e) {
                            console.error(e);
                            res(ytResult);
                        }
                    } else res()
                }
            }*/
        }
    });
    ctx.music[msg.channel.guild.id].fetchNextTracks = async () => {
        if(ctx.music[msg.channel.guild.id].queue[1]) {
            ctx.music[msg.channel.guild.id].createAlbumArt(ctx.music[msg.channel.guild.id].queue[1])
            await ctx.music[msg.channel.guild.id].fetchTrack(ctx.music[msg.channel.guild.id].queue[1]);
        }
        if(ctx.music[msg.channel.guild.id].queue[2]) {
            ctx.music[msg.channel.guild.id].createAlbumArt(ctx.music[msg.channel.guild.id].queue[2])
            await ctx.music[msg.channel.guild.id].fetchTrack(ctx.music[msg.channel.guild.id].queue[2]);
        }
    }
    ctx.music[msg.channel.guild.id].nextTrack = async (arg, songobj) => {
        console.debugLog(arg)
        if(switching) {console.debugLog(`already switching!`); return false;}
        ctx.music[msg.channel.guild.id].nextTrackIsReady = false;
        if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].noPlayTimeout) {clearTimeout(ctx.music[msg.channel.guild.id].noPlayTimeout); ctx.music[msg.channel.guild.id].noPlayTimeout = null;}
        ctx.music[msg.channel.guild.id].removeTimeEnd()
        switching = true;
        ctx.music[msg.channel.guild.id].loadingNext = true;
        if(!ctx.music[msg.channel.guild.id].queue) return;

        let currentBitrate = ctx.music[msg.channel.guild.id].connection.bitrate;
        let channelBitrate = ctx.music[msg.channel.guild.id].channel.bitrate;

        console.d(`setting bitrate to 384k just to test it lol`)
        ctx.music[msg.channel.guild.id].connection.bitrate = 384000

        try {
            ctx.music[msg.channel.guild.id].queue[0].stream.destroy();
            console.d(`Successfully destroyed musicApi response`)
        } catch(e) {
            console.warn(`Failed to destroy musicApi response: ${e}`)
        }

        if(ctx.music[msg.channel.guild.id].queue[0].stream) try {
            ctx.music[msg.channel.guild.id].queue[0].stream.socket._httpMessage.end()
            ctx.music[msg.channel.guild.id].queue[0].stream.socket._httpMessage.destroy()
        } catch(e) {};

        if(ctx.music[msg.channel.guild.id].queue[0].stream) try {
            ctx.music[msg.channel.guild.id].queue[0].req.stream.socket._httpMessage.end()
            ctx.music[msg.channel.guild.id].queue[0].req.stream.socket._httpMessage.destroy()
        } catch(e) {};

        if(ctx.music[msg.channel.guild.id].ffmpeg) try {
            ctx.music[msg.channel.guild.id].ffmpeg.stdin.destroy()
            ctx.music[msg.channel.guild.id].ffmpeg.kill(`SIGINT`)
        } catch(e) {};

        delete ctx.music[msg.channel.guild.id].nowPlayingEnd
        delete ctx.music[msg.channel.guild.id].startedTime
        delete ctx.music[msg.channel.guild.id].timeInMs
        try {
            intentionalEnd = true;
            ctx.music[msg.channel.guild.id].connection.stopPlaying()
        } catch(e) {}; 
        let waitForTone = false;

        try {
            ctx.music[msg.channel.guild.id].queue[0].passthru.destroy();
            console.d(`Successfully destroyed musicApi stream passthrough`)
        } catch(e) {
            console.warn(`Failed to destroy musicApi stream passthrough: ${e}`)
        }  

        if(ctx.music[msg.channel.guild.id].queue[0] && (ctx.music[msg.channel.guild.id].singleLoop || ctx.music[msg.channel.guild.id].loop)) {
            ctx.music[msg.channel.guild.id].queue[0][7] = ctx.utils.randomGen(16)
        }
        
        try {
            if(!(arg == 'first') && !(arg == `skipto`)) {
                let previousSong;
                ctx.music[msg.channel.guild.id].uniqueId = ctx.utils.randomGen(6)
                if(arg == 'forceskip' || arg == 'forceskipB') {
                    previousSong = ctx.music[msg.channel.guild.id].queue.shift();
                } else {
                    if(ctx.music[msg.channel.guild.id].singleLoop === false) {
                        if(ctx.music[msg.channel.guild.id].loop === true) {
                            await ctx.music[msg.channel.guild.id].addTrack(ctx.music[msg.channel.guild.id].queue.shift());
                        } else {
                            previousSong = ctx.music[msg.channel.guild.id].queue.shift();
                        }
                    }
                };
                if(previousSong && previousSong[7] && ctx.streamCache[previousSong[7]]) {delete ctx.streamCache[previousSong[7]]}
            } else {
                if(arg == `skipto` && songobj) {
                    ctx.music[msg.channel.guild.id].queue.unshift(songobj)
                }
                //await new Promise(r => setTimeout(r, 1000));
            }
        } catch(e) {
            try {
                switching = false;
                return await ctx.music[msg.channel.guild.id].hold(arg)
            } catch(e) {}
        };
        switching = false;
        ctx.music[msg.channel.guild.id].loadingNext = false;
        
        queueFunc(ctx, msg, `update`);

        if((msg.channel.guild.guildSetting && msg.channel.guild.guildSetting.musicChime === true) && (arg == `skip` || arg == `forceskip` || arg == `forceskipB` || arg == 'skipto')) {
            waitForTone = true;
            ctx.timeout(225).then(() => {
                if(arg == `skip` || arg == `skipto` || arg == `forceskipB`) {
                    //ctx.music[msg.channel.guild.id].tempVol = ctx.music[msg.channel.guild.id].connection.volume
                    //ctx.music[msg.channel.guild.id].connection.setVolume(0.50)
                    ctx.music[msg.channel.guild.id].connection.startPlaying(`./res/sound-effects/music/skip.wav`, STANDARDPLAYARGS())
                    ctx.timeout(1341).then(() => {
                        ctx.music[msg.channel.guild.id].connection.stopPlaying()
                        ctx.music[msg.channel.guild.id].eventEmitter.emit(`readyForNext`);
                    })
                } else if(arg == `forceskip`) {
                    waitForTone = true;
                    //ctx.music[msg.channel.guild.id].tempVol = ctx.music[msg.channel.guild.id].connection.volume
                    //ctx.music[msg.channel.guild.id].connection.setVolume(0.50)
                    ctx.music[msg.channel.guild.id].connection.startPlaying(`./res/sound-effects/music/err.wav`, STANDARDPLAYARGS())
                    ctx.timeout(1835).then(() => {
                        ctx.music[msg.channel.guild.id].connection.stopPlaying()
                        ctx.music[msg.channel.guild.id].eventEmitter.emit(`readyForNext`);
                    })
                }
            })
        };
        
        let np = ctx.music[msg.channel.guild.id].queue[0];
        //console.log(`queue: `, ctx.music[msg.channel.guild.id].queue, `np: `, ctx.music[msg.channel.guild.id].queue[0])
        if(!np) {return ctx.music[msg.channel.guild.id].hold(arg)};

        if(`${np[10]}`.includes(`?startTime=`)) {
            console.d(`url includes ?startTime, trimming...`);
            np[10] = `${np[10]}`.split(`?startTime=`)[0]
        };

        if(`${np[10]}`.includes(`&startTime=`)) {
            console.d(`url includes &startTime, trimming...`);
            np[10] = `${np[10]}`.split(`&startTime=`)[0]
        };
        
        ctx.music[msg.channel.guild.id].forceUpdateNowPlaying(false)
        
        delete ctx.music[msg.channel.guild.id].nowPlayingUpdate
        ctx.music[msg.channel.guild.id].forceUpdateNowPlaying(false)

        ctx.music[msg.channel.guild.id].fetchTrack(np)

        new Promise(async (res) => {
            console.d(`Updating most recent track list!`)
            let thing = await ctx.seq.models.Server.findOne({where: {id: msg.channel.guild.id}});
            if(!thing) {
                let a = await ctx.seq.models.Server.build({id: msg.channel.guild.id});
                await a.save();
                thing = await ctx.seq.models.Server.findOne({where: {id: msg.channel.guild.id}});
            };

            let json = [];

            try {
                json = JSON.parse(thing.dataValues.musicLastPlayed)
            } catch(e) {
                console.w(`Failed to read last played music! ${e}`)
            };

            const thisSong = {
                name: np[0],
                duration: np[1],
                link: np[2],
                thumbnail: np[4],
                from: np[6]
            }

            if(JSON.stringify(thisSong) == JSON.stringify(json[0])) {
                console.d(`This song ${thisSong.name} is equivalent to the previous song ${json[1] ? json[1].name : `-nope-`}! Skipping this entry...`);
                return res({
                    json,
                    modified: false
                });
            } else if(json.find(f => f.name == thisSong.name)) {
                const origIndex = json.findIndex(f => f.name == thisSong.name)
                console.d(`This song ${thisSong.name} already has an entry in this server's JSON at index ${origIndex}! Moving that to first.`);
                json.unshift(json.splice(origIndex, 1)[0]);
            } else {
                console.d(`This song ${thisSong.name} is a new entry! Adding...`)
                json = [thisSong, ...json.slice(0,4)];
            }

            await thing.update( { musicLastPlayed: JSON.stringify(json) }, { where: { id: msg.channel.guild.id, } });
            
            thing.save().then((g) => {
                g.oldUpdate = g.update
                g.update = (...args) => new Promise(async (res, rej) => {
                    let rawB = false;
                    if(args[1] && args[1].raw) {raw = true; args[1].raw = false;}
                    g.oldUpdate(...args).then(async r => {
                            res(rawB && r.dataValues ? r.dataValues : r)
                    }).catch(rej)
                }); 
                ctx.bot.guilds.get(msg.channel.guild.id).guildSettingRaw = g;
                ctx.bot.guilds.get(msg.channel.guild.id).guildSetting = g.dataValues;
                return res({
                    json,
                    modified: true
                });
            });
        }).then(console.d)

        ctx.music[msg.channel.guild.id].createAlbumArt(np)

        let updated = false;
        let startedPlaying = false;
        
        const u = `${np[2]}`
        
        let play, streamCancelled = false;

        const cancelStream = () => {
            if(!streamCancelled) {
                streamCancelled = true;
                
                if(np.stream) try {
                    np.stream.destroy()
                } catch(e) {};
                if(np.stream) try {
                    np.stream.socket._httpMessage.end()
                    np.stream.socket._httpMessage.destroy()
                } catch(e) {};
                if(np.stream) try {
                    np.stream.req.socket._httpMessage.end()
                    np.stream.req.socket._httpMessage.destroy()
                } catch(e) {};
                if(np.passthru) try {
                    np.passthru.destroy()
                } catch(e) {};
    
                if(!ctx.music[msg.channel.guild.id].queue[0] || np[7] != ctx.music[msg.channel.guild.id].queue[0][7]) {
                    ctx.music[msg.channel.guild.id].nextTrack(`forceskip`);
                }
            }
        }

        ctx.music[msg.channel.guild.id].noPlayTimeout = setTimeout(uid => {
            if(ctx.music[msg.channel.guild.id] && uid == ctx.music[msg.channel.guild.id].queue[0][7]) {
                if(!startedPlaying && !updated && (u == ctx.music[msg.channel.guild.id].queue[0][2])) {
                    console.d(`song didnt load within 30 seconds.`);
                    msg.reply(`${ctx.fail} I was unable to finish the previous song!\n- The song didn't load in time! Please try again later, or if this issue persists, let us know in **Nyx's Shrine!**`);
                    cancelStream();
                }
    
                updated = false;
                intentionalEnd = false;
                ctx.music[msg.channel.guild.id].noPlayTimeout = null;
            }
        }, 30000, `${np[7]}`);

        ctx.music[msg.channel.guild.id].paused = false;

        ctx.music[msg.channel.guild.id].fetchNextTracks();

        const stream = () => new Promise(async (res, rej) => {
            if(ctx.music[msg.channel.guild.id].queue[0] && np[7] == ctx.music[msg.channel.guild.id].queue[0][7]) {
                if(ctx.music[msg.channel.guild.id].eq.next) {
                    ctx.music[msg.channel.guild.id].eq = ctx.music[msg.channel.guild.id].eq.next; 
                    delete ctx.music[msg.channel.guild.id].eq.next
                };

                try {
                    intentionalEnd = true;
                    ctx.music[msg.channel.guild.id].connection.stopPlaying()
                }catch(e) {};

                if(ctx.music[msg.channel.guild.id].tempVol) {
                    ctx.music[msg.channel.guild.id].connection.setVolume(ctx.music[msg.channel.guild.id].tempVol); 
                    delete ctx.music[msg.channel.guild.id].tempVol
                }

                await ctx.music[msg.channel.guild.id].connection.startPlaying(null, STANDARDPLAYARGS(ctx.music[msg.channel.guild.id].queue[0][1][0] == null ? Object.assign({}, ctx.music[msg.channel.guild.id].eq, {samplemult: undefined}) : ctx.music[msg.channel.guild.id].eq));

                updated = true, startedPlaying = true;

                ctx.music[msg.channel.guild.id].nextTrackIsReady = true;
                ctx.music[msg.channel.guild.id].eventEmitter.emit(`nextTrackIsReady`)
                ctx.music[msg.channel.guild.id].connection.emit('nowPlayingANewTrack', np)
                ctx.music[msg.channel.guild.id].forceUpdateNowPlaying(true);

                res()
            } else rej(`Nowplaying is NOT equal to the first in queue! Cancelling...`)
        })

        let playNextCalled = false;

        const playNext = () => {
            if(!playNextCalled) {
                playNextCalled = 1;

                console.d(`Now running playNext! (${msg.channel.guild.id})`);
    
                stream().then(r => {
                    console.d(`> playNext has completed its run!`);
                    //if(ctx.music[msg.channel.guild.id].noPlayTimeout) clearTimeout(ctx.music[msg.channel.guild.id].noPlayTimeout)
                }).catch(e => {
                    console.error(`> playNext has ERRORED:`, e);
                    cancelStream();
                })
            } else {
                playNextCalled++;
                console.d(`Playnext was called, but this is attempt #${playNextCalled} -- ignoring!`)
            }
        }

        if(waitForTone) {
            waitForTone = false;
            let nextPlayed = false;
            ctx.music[msg.channel.guild.id].eventEmitter.once('readyForNext', () => {if(!nextPlayed) {playNext(); nextPlayed = true;}});
            setTimeout((UID) => {
                if(!nextPlayed && ctx.music[msg.channel.guild.id].uniqueId == UID) {playNext(); nextPlayed = true;}
            }, 2000, ctx.music[msg.channel.guild.id].uniqueId)
        } else {
            return playNext()
        }
    }
    console.d(`[${msg.channel.guild.id}] CREATED NEXTTRACK FUNCTION`)
    if(ctx.music[msg.channel.guild.id].queue && typeof ctx.music[msg.channel.guild.id].queue.length == `number` && ctx.music[msg.channel.guild.id].queue.length !== 0) {
        ctx.music[msg.channel.guild.id].nextTrack('first')
        console.d(`[${msg.channel.guild.id}] NOW PLAYING THE FIRST TRACK`)
        resolveStart()
    } else {
        ctx.music[msg.channel.guild.id].hold()
        console.d(`[${msg.channel.guild.id}] NO BEGINNING TRACK IN THE QUEUE; PUT ON HOLD.`)
        resolveStart()
    }
});

const joinChannel = (ctx, msg, msg2, continueVoiceChannel) => new Promise(async (res, rej) => {
    console.d(`JOINCHANNEL CALLED FOR GUILD ${msg.channel.guild.id}`)
    if(!continueVoiceChannel && ctx.music[msg.channel.guild.id] && msg.channel.guild.me.voiceState && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {
        console.d(`[${msg.channel.guild.id}] MEMBER WAS NOT IN MY VOICE CHANNEL`)
        if(msg2 && msg2.edit && typeof msg2.edit == `function`) return msg2.edit(`${ctx.fail} You must be in my voice channel before you can use this!`)
        return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)
    } else {
        let f = async () => {}

        let alreadySent = false;
        let lastMsgByNyxInTxt

        try {
            if(msg.author.id == ctx.bot.user.id) {
                lastMsgByNyxInTxt = msg;
                alreadySent = true;
            } else {
                lastMsgByNyxInTxt = Array.from(msg.channel.messages).reverse().find(m => m[1].author.id == ctx.bot.user.id);
                if(lastMsgByNyxInTxt) {
                    lastMsgByNyxInTxt = lastMsgByNyxInTxt[1]
                    if(lastMsgByNyxInTxt.content.toLowerCase().includes(`joining`) || lastMsgByNyxInTxt.content.toLowerCase().includes(`working...`)) {
                        if(Date.now() > lastMsgByNyxInTxt.createdAt + 1000) {
                            console.d(`THERE WAS ALREADY A MESSAGE SENT`)
                            alreadySent = true;
                        }
                    }
                }
            }
        } catch(e) {console.de(`error with msesfg send thing idk here stack ${new Error().stack}`, e)}

        //console.log(msg.interaction, msg.type)

        if(msg && typeof msg == `object` && msg.type === 3) {
            f = await msg.reply(msg2)
        } else if(alreadySent) {
            f = lastMsgByNyxInTxt
        } else {
            if(msg2 && typeof msg2 == `object` && msg2.edit) {
                f = msg2.edit
            } else if(msg2 && typeof msg2 == `string`) {
                f = await msg.reply(msg2); // f will become the raw message object, because it will not be edited if it sees that "msg2" is a string.
            } else {
                f = msg.reply
            }
        }

        if(!ctx.music[msg.channel.guild.id]) {
            let m = {};
            try {
                if(typeof f == `function`) {
                    m = await f(`${ctx.processing} Joining your voice channel...`)
                } else {
                    m = f
                };
            } catch(e) {console.e(e)};

            // as said before, "m" will be defined as the message object "msg2" from the if/else area, if it is seen as a string.

            start(ctx, msg, null, continueVoiceChannel).then(async r => {
                console.d(`[${msg.channel.guild.id}] SUCCESSFULLY STARTED THE MUSIC FUNCTIONALITY`);
                m.content = `<:NyxSing:942164350649663499> Successfully joined your voice channel, and`
                res(m)
            }).catch(e => {
                console.de(`error in start:`, e);
                m.edit(`${ctx.fail} ${e.toLowerCase().includes(`permission`) ? `I don't have permission to join your voice channel!` : ctx.errMsg()}`)
                rej(`${typeof e == `string` ? e : `I wasn't able to join the voice channel!`}`)
            })
        } else {
            if(msg2 && msg2.content) {
                msg2.content = `<:NyxSing:942164350649663499> Successfully`
                return res(msg2)
            } else {
                if(msg2 && typeof msg2 == `string`) {
                    let m = await msg.reply(msg2);
                    m.content = `<:NyxSing:942164350649663499> Successfully`
                    return res(m)
                } else {
                    let m = await msg.reply(`${ctx.processing} Working...`);
                    m.content = `<:NyxSing:942164350649663499> Successfully`
                    return res(m)
                }
            }
        }
    }
})

async function findYT(ctx, msg2, arg, msg) {
    if(typeof arg == `string`) {
        let info;
        try {
            info = await ctx.libs.ytdl.getInfoForDownloadThing(arg);
        } catch(e) {
            try {
                info = await ctx.libs.ytdl.getInfoForDownloadThing(arg);
            } catch(e) {
                try {
                    info = await ctx.libs.ytdl.getInfoForDownloadThing(arg);
                } catch(e) {
                    return await msg2.edit(`${ctx.fail} ${ctx.yt} I was unable to add **\`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\`** to the queue!\n${ctx.utils.parseMusicError(ctx, `yt`, e)}`)
                }
            }
        }
        if(info) {
            let origInfo = {...info}
            info.videoDetails.formats = info.formats
            info = info.videoDetails
            if(info.liveBroadcastDetails && info.liveBroadcastDetails.isLiveNow) return msg2.edit(`${ctx.fail} ${ctx.yt} I was unable to add ${ctx.utils.escapeDiscordsFuckingEditing(info.title)}! (I'm unable to queue live streams!)`)
            if(Number(info.lengthSeconds)*1000 > msg.author.maxtime) return msg2.edit(`${ctx.fail} ${ctx.yt} I was unable to add ${ctx.utils.escapeDiscordsFuckingEditing(info.title)}! (You can't play songs longer than ${(await ctx.utils.timeConvert(msg.author.maxtime))})`)
            // MUSIC SHIT
            let thumbnailUrl = `https://i3.ytimg.com/vi/${info.videoId}/maxresdefault.jpg`
            try {
                msg2 = await joinChannel(ctx, msg, msg2);
            } catch(e) {return}
            let pos = await ctx.music[msg.channel.guild.id].addTrack([`${ctx.utils.escapeDiscordsFuckingEditing(`${info.author.name} - ${info.title}`)}`, [`${Number(info.lengthSeconds)*1000}`], `${info.video_url}`, `${msg.author.id}`, `${thumbnailUrl}`, `${info.videoId}`, `yt`, ctx.utils.randomGen(16)])
            const v = info;
            ctx.music[msg.channel.guild.id].queue[pos][10] = () => ctx.libs.ytdl.download(origInfo, { filter: 'audioonly', quality:'highestaudio' });
            await msg2.edit(await ctx.utils.music.getMusicCard(ctx, `${msg2.content} added ${ctx.yt} **"${ctx.music[msg.channel.guild.id].queue[pos][0]}"** \`[${ctx.utils.timestampConvert(ctx.music[msg.channel.guild.id].queue[pos][1][0] || ctx.music[msg.channel.guild.id].queue[pos][1])}]\` to the queue, starting ${pos === 0 ? `**now**` : pos === 1 ? `**after this song**` : `at position **${pos}**`}!`, {
                        url: ctx.music[msg.channel.guild.id].queue[pos][2],
                        icon: ctx.music[msg.channel.guild.id].queue[pos][4],
                        title: ctx.music[msg.channel.guild.id].queue[pos][0],
                        username: ctx.bot.users.get(ctx.music[msg.channel.guild.id].queue[pos][3]).username
                    }))
        }
    } else {
        if(!arg.results || arg.results.length === 0) return msg2.edit(`${ctx.fail} ${ctx.yt} I was unable to add this playlist to the queue!\n${ctx.utils.parseMusicError(ctx, `yt`, e)}`)
        let queue = [], failedTime = 0, failedLive = 0;
        while(arg.results.find(song => Number(song.duration[0]) > msg.author.maxtime)) {
            const song = arg.results.find(song => Number(song.duration[0]) > msg.author.maxtime)
            arg.results.splice(arg.results.findIndex(song => Number(song.duration[0]) > msg.author.maxtime), 1);
            arg.totalduration = arg.totalduration - Number(song.duration[0][0]); failedTime++
            await ctx.timeout(25)
        }; while(arg.results.find(song => song.live === true)) {
            const song = arg.results.find(song => song.live === true)
            arg.results.splice(arg.results.findIndex(song => song.live === true), 1);
            arg.totalduration = arg.totalduration - Number(song.duration[0]); failedLive++
            await ctx.timeout(25)
        }; 
        queue = arg.results.map(song => [ctx.utils.escapeDiscordsFuckingEditing(`${song.artists[0]} - ${song.title}`), song.duration, song.url, msg.author.id, song.thumbnail, song.id, `yt`, ctx.utils.randomGen(16), undefined, {
            name: arg.name,
            source: arg.source,
            type: arg.type,
            url: arg.url
        }]);
        if(failedTime === arg.results.length) return msg2.edit(`${ctx.fail} ${ctx.yt} I was unable to add the playlist ${ctx.utils.escapeDiscordsFuckingEditing(arg.name)}! (Every song is longer than ${(await ctx.utils.timeConvert(msg.author.maxtime))})`)
        try {
            msg2 = await joinChannel(ctx, msg, msg2);
        } catch(e) {return}
        let pos = await ctx.music[msg.channel.guild.id].addTrack(queue); let ext1 = ``
        if(failedTime !== 0) {
            ext1 = ` (skipped ${failedTime} due to duration limit of ${(await ctx.utils.timeConvert(msg.author.maxtime))}${failedLive == 0 ? `` : `, and ${failedLive} more because I still can't play livestreams`})`
        } else if(failedLive !== 0) {
            ext1 = ` (skipped ${failedLive} because I can't play livestreams)`
        }
        if(msg.channel.permissionsOf || msg.channel.permissionsOf(ctx.bot.user.id).has(`SEND_MESSAGES`) && msg.channel.permissionsOf(ctx.bot.user.id).has(`EMBED_LINKS`)) {
            let artists = [];
            if(arg.results[0].artists) {
                arg.results.map(s => s.artists).forEach(artistArr => artists.push(...artistArr))
            } else if(arg.results[0].artist) {
                arg.results.map(s => s.artist).forEach(artist => artists.push(artist));
            }; artists = [...new Set(artists)];
            let parsedArtists = artists.filter(a => a != `` && `${a}`.length > 2 && a !== null)
            let artistString = parsedArtists.length > 0 ? `Featuring **${parsedArtists.map(a => ctx.utils.escapeDiscordsFuckingEditing(a)).splice(0, 3).join(`**, **`) || `--`}**  ${parsedArtists.length > 3 ? `and ${parsedArtists.length-3} more.` : ``}` : null
            await msg2.edit({
                content: `${msg2.content} added the ${arg.type} to the queue, starting ${pos === 0 ? `**now**` : pos === 1 ? `**after this song**` : `at position **${pos}**`} with **"${ctx.music[msg.channel.guild.id].queue[pos][0]}"**`,
                embeds: [{
                    title: `Added ${arg.source} ${arg.type} "${ctx.utils.escapeDiscordsFuckingEditing(arg.name)}" with ${arg.results.length} tracks`,
                    color: ctx.utils.colors(arg.source.toLowerCase()),
                    description: artistString,
                    thumbnail: {url: arg.thumbnail},
                    author: artistString ? {
                        name: `${arg.type[0].toUpperCase() + arg.type.slice(1)} by ${arg.owner.name}`,
                        url: arg.url,
                        icon_url: ctx[arg.source.toLowerCase() + `url`]
                    } : undefined
                }]
            })
        } else await msg2.edit(`${msg2.content} added ${arg.source} ${arg.type} **${ctx.utils.escapeDiscordsFuckingEditing(arg.name)}** with ${arg.results.length} tracks${ext1}${queue.length !== 0 ? ` \`[${ctx.utils.timestampConvert(arg.totalduration)}]\`` : ``}${queue.length !== 0 ? ` to the queue, starting ${pos === 0 ? `**now**` : pos === 1 ? `**after this song**` : `at position **${pos}**`} with **"${ctx.music[msg.channel.guild.id].queue[pos][0]}"**` : ``}`)
    }
}
async function findSC(ctx, msg2, arg, msg) {
    if(typeof arg == `string`) {
        let info;
        try {
            info = await ctx.libs.scdl.getInfo(arg);
        } catch(e) {
            try {
                info = await ctx.libs.scdl.getInfo(arg);
            } catch(e) {
                try {
                    info = await ctx.libs.scdl.getInfo(arg);
                } catch(e) {
                    console.l(`${e}`)
                    return await msg2.edit(`${ctx.fail} <:soundcloud:725527317618753557> I was unable to add **\`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\`** to the queue!\n${ctx.utils.parseMusicError(ctx, `sc`, e)}`)
                }
            }
        }
        if(info) {
            if(info.kind !== 'track') {
                return await msg2.edit(`${ctx.fail} <:soundcloud:725527317618753557> I was unable to add **\`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\`** to the queue! [not a track!]`)
            }
            if(Number(info.duration) > msg.author.maxtime) return msg2.edit(`${ctx.fail} ${ctx.sc} I was unable to add ${ctx.utils.escapeDiscordsFuckingEditing(info.title)}! (You can't play songs longer than ${(await ctx.utils.timeConvert(msg.author.maxtime))})`)
            let thumbnailUrl = `${info.artwork_url}`;
            let meta = {};
            meta.title = info.title;
            meta.artist = info.user.username;
            if(info.publisher_metadata && info.publisher_metadata.album_title && info.publisher_metadata.album_title !== ``) {meta.album = info.publisher_metadata.album_title};
            if(info.genre) {meta.genre = info.genre};
            if(info.display_date) {
                if(info.display_date.length === 10 || info.display_date.length === 20) {
                    meta[`date-released`] = ctx.libs.moment(info.display_date).format("MMMM Do, YYYY");
                    if(meta[`date-released`] == `Invalid date`) {meta[`date-released`] = info.display_date}
                } else {
                    meta[`date-released`] = info.display_date
                }
            }
            meta.likes = info.likes_count;
            let duration = [info.duration]; // add support for soundcloud snippets
            if(info.duration !== info.full_duration) {duration.push(info.full_duration)}
            // vv commented those out because nyx now supports soundcloud go, but the native package does not.
            //let duration = [info.full_duration]
            try {
                msg2 = await joinChannel(ctx, msg, msg2);
            } catch(e) {return}

            const track = [`${ctx.utils.escapeDiscordsFuckingEditing(`${info.user.username} - ${info.title}`)}`, duration, `${info.permalink_url}`, `${msg.author.id}`, `${thumbnailUrl}`, `${info.urn}`, `sc`, ctx.utils.randomGen(16)]

            let pos = await ctx.music[msg.channel.guild.id].addTrack(track)
            await msg2.edit(await ctx.utils.music.getMusicCard(ctx, `${msg2.content} added ${ctx.sc} **"${track[0]}"** \`[${ctx.utils.timestampConvert(track[1][0] || track[1])}]\` to the queue, starting ${pos === 0 ? `**now**` : pos === 1 ? `**after this song**` : `at position **${pos}**`}!`, {
                        url: ctx.music[msg.channel.guild.id].queue[pos][2],
                        icon: ctx.music[msg.channel.guild.id].queue[pos][4],
                        title: ctx.music[msg.channel.guild.id].queue[pos][0],
                        username: ctx.bot.users.get(ctx.music[msg.channel.guild.id].queue[pos][3]).username
                    }))
        }
    } else {
        if(!arg.results || arg.results.length === 0) return msg2.edit(`${ctx.fail} ${ctx.sc} I was unable to add this set to the queue!\n${ctx.utils.parseMusicError(ctx, `sc`, e)}`)
        let queue = [], failedTime = 0, failedLive = 0;
        while(arg.results.find(song => Number(song.duration[0]) > msg.author.maxtime)) {
            const song = arg.results.find(song => Number(song.duration[0]) > msg.author.maxtime)
            arg.results.splice(arg.results.findIndex(song => Number(song.duration[0]) > msg.author.maxtime), 1);
            arg.totalduration = arg.totalduration - Number(song.duration[0][0]); failedTime++
            await ctx.timeout(25)
        }; while(arg.results.find(song => song.live === true)) {
            const song = arg.results.find(song => song.live === true)
            arg.results.splice(arg.results.findIndex(song => song.live === true), 1);
            arg.totalduration = arg.totalduration - Number(song.duration[0]); failedLive++
            await ctx.timeout(25)
        }; 
        queue = arg.results.map(song => [ctx.utils.escapeDiscordsFuckingEditing(`${song.artists[0]} - ${song.title}`), song.duration, song.url, msg.author.id, song.thumbnail, song.id, `sc`, ctx.utils.randomGen(16), undefined, {
            name: arg.name,
            source: arg.source,
            type: arg.type,
            url: arg.url
        }]);
        if(failedTime === arg.results.length) return msg2.edit(`${ctx.fail} ${ctx.yt} I was unable to add the playlist ${ctx.utils.escapeDiscordsFuckingEditing(arg.name)}! (Every song is longer than ${(await ctx.utils.timeConvert(msg.author.maxtime))})`)
        try {
            msg2 = await joinChannel(ctx, msg, msg2);
        } catch(e) {return}
        let pos = await ctx.music[msg.channel.guild.id].addTrack(queue); let ext1 = ``
        if(failedTime !== 0) {
            ext1 = ` (skipped ${failedTime} due to duration limit of ${(await ctx.utils.timeConvert(msg.author.maxtime))}${failedLive == 0 ? `` : `, and ${failedLive} more because I still can't play livestreams`})`
        } else if(failedLive !== 0) {
            ext1 = ` (skipped ${failedLive} because I can't play livestreams)`
        }
        if(msg.channel.permissionsOf || msg.channel.permissionsOf(ctx.bot.user.id).has(`SEND_MESSAGES`) && msg.channel.permissionsOf(ctx.bot.user.id).has(`EMBED_LINKS`)) {
            let artists = [];
            if(arg.results[0].artists) {
                arg.results.map(s => s.artists).forEach(artistArr => artists.push(...artistArr))
            } else if(arg.results[0].artist) {
                arg.results.map(s => s.artist).forEach(artist => artists.push(artist));
            }; artists = [...new Set(artists)];
            let parsedArtists = artists.filter(a => a != `` && `${a}`.length > 2 && a !== null)
            let artistString = parsedArtists.length > 0 ? `Featuring **${parsedArtists.map(a => ctx.utils.escapeDiscordsFuckingEditing(a)).splice(0, 3).join(`**, **`) || `--`}**  ${parsedArtists.length > 3 ? `and ${parsedArtists.length-3} more.` : ``}` : null
            await msg2.edit({
                content: `${msg2.content} added the ${arg.type} to the queue, starting ${pos === 0 ? `**now**` : pos === 1 ? `**after this song**` : `at position **${pos}**`} with **"${ctx.music[msg.channel.guild.id].queue[pos][0]}"**`,
                embeds: [{
                    title: `Added ${arg.source} ${arg.type} "${ctx.utils.escapeDiscordsFuckingEditing(arg.name)}" with ${arg.results.length} tracks`,
                    color: ctx.utils.colors(arg.source.toLowerCase()),
                    description: artistString,
                    thumbnail: {url: arg.thumbnail},
                    author: artistString ? {
                        name: `${arg.type[0].toUpperCase() + arg.type.slice(1)} by ${arg.owner.name}`,
                        url: arg.url,
                        icon_url: ctx[arg.source.toLowerCase() + `url`]
                    } : undefined
                }]
            })
        } else await msg2.edit(`${msg2.content} added ${arg.source} ${arg.type} **${ctx.utils.escapeDiscordsFuckingEditing(arg.name)}** with ${arg.results.length} tracks${ext1}${queue.length !== 0 ? ` \`[${ctx.utils.timestampConvert(arg.totalduration)}]\`` : ``}${queue.length !== 0 ? ` to the queue, starting ${pos === 0 ? `**now**` : pos === 1 ? `**after this song**` : `at position **${pos}**`} with **"${ctx.music[msg.channel.guild.id].queue[pos][0]}"**` : ``}`)
    }
}
async function fileShit(ctx, msg2, arg, msg) {
    ctx.libs.getaudioduration(arg).then(dur => Math.round(dur*1000)).then(async dur => {
        ctx.libs.readTags(arg, async (err, tags) => {
            let array = arg.split('/');
            let title = array[array.length-1];
            let meta = {}
            if(!err && tags) {
                if(tags.title) {title = tags.title; meta.title = tags.title}
                /*if(tags.ARTISTS) {
                    artists = tags.artist.split(' / ')
                    meta.artist = artists[0]
                    console.l(artists)
                    titl = title; title = `${tags.artist.split(' / ')[0]} - ${titl}`
                    if(artists.length !== 1 && !(title.includes('feat.') || title.includes('ft.'))) {
                        artists.shift();
                        meta.artists = artists
                        title = title + ` (feat. ${artists.join(', ')})`
                    }
                } else */if(tags.artist) {
                    artists = tags.artist.split('; ')
                    meta.artist = artists[0]
                    titl = title; title = `${artists[0]} - ${titl}`
                    if(artists.length !== 1 && !(title.includes('feat.') || title.includes('ft.'))) {
                        artists.shift()
                        meta.artists = artists
                        title = title + ` (feat. ${artists.join(', ')})`
                    }
                } else if(tags.album_artist) {
                    meta.artist = tags.album_artist
                    titl = title; title = `${tags.album_artist} - ${titl}`
                };
                if(tags.album) {meta.album = tags.album};
                if(tags.genre) {meta.genre = tags.genre};
                if(tags.date) {
                    if(tags.date.length === 10) {
                        meta[`date-released`] = ctx.libs.moment(tags.date).format("MMMM Do, YYYY");
                        if(meta[`date-released`] == `Invalid date`) {meta[`date-released`] = tags.date}
                    } else {
                        meta[`date-released`] = tags.date
                    }
                }
                if(tags.track) {meta.track = tags.track}
            }
            if(Number(dur) > msg.author.maxtime) return msg2.edit(`${ctx.fail} ${ctx.file} I was unable to add ${ctx.utils.escapeDiscordsFuckingEditing(title)}! (You can't play songs longer than ${(await ctx.utils.timeConvert(msg.author.maxtime))})`)
            try {
                msg2 = await joinChannel(ctx, msg, msg2);
            } catch(e) {return}
            let pos = await ctx.music[msg.channel.guild.id].addTrack([`${ctx.utils.escapeDiscordsFuckingEditing(title)}`, [`${dur}`], `${arg}`, `${msg.author.id}`, null, null, `file`, ctx.utils.randomGen(16)]);
            await msg2.edit(await ctx.utils.music.getMusicCard(ctx, `${msg2.content} added ${ctx.file} **"${ctx.music[msg.channel.guild.id].queue[pos][0]}"** \`[${ctx.utils.timestampConvert(ctx.music[msg.channel.guild.id].queue[pos][1][0] || ctx.music[msg.channel.guild.id].queue[pos][1])}]\` to the queue, starting ${pos === 0 ? `**now**` : pos === 1 ? `**after this song**` : `at position **${pos}**`}!`, {
                        url: ctx.music[msg.channel.guild.id].queue[pos][2],
                        icon: ctx.music[msg.channel.guild.id].queue[pos][4],
                        title: ctx.music[msg.channel.guild.id].queue[pos][0],
                        username: ctx.bot.users.get(ctx.music[msg.channel.guild.id].queue[pos][3]).username
                    }))
        })
    }).catch(e => {
        return msg2.edit(`${ctx.fail} <:file:725527317408907285> I was unable to add **\`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\`** to the queue!\n${ctx.utils.parseMusicError(ctx, `file`, e)}`)
    })
}
function playText(p, count) {
    let ext = ``;
    if(count !== 1) {
        ext = `\n> **\`${p}play 1, 2...\`** to add multiple songs`
    }
    return `Please select a track using:\n> **\`${p}play <1 - ${count}>\`** to select a specific song${ext}\n> **\`${p}play all\`** to add every song`
}

module.exports = {
    STANDARDPLAYARGS,
    lookupTrack,
    getStreamLegacy,
    fetchFromApi,
    getStream,
    nowPlayingFunc,
    queueFunc,
    start,
    joinChannel,
    findYT,
    findSC,
    fileShit,
    playText,
    getMusicCard,
    regex: {
        url, youtube, ytplaylist, soundcloud, scplaylist, spotifyplaylist, spotify, discordfile
    }
}
module.exports = {
    "name": "play",
    "desc": "Add a song to the queue for your voice channel/start a queue for your voice channel!",
    "args": [
        {
            "opt": false,
            "arg": "song / URL"
        }
    ],
    "aliases": [
        "p"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "song",
                "description": "The name or URL of a song!",
                "required": false
            }
        ]
    },
    func: async function play(ctx, msg, args) {
        if(!msg.member.voiceState) return msg.reply(`${ctx.fail} You must be in a voice channel before you can play music!`);
        if(!msg.channel.guild.me.voiceState && ctx.music[msg.channel.guild.id]) delete ctx.music[msg.channel.guild.id]
        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)} else {
            let allNum = false, numbers = [];
            if(args.length <= 5) {
                let nums = 0;
                args.forEach(arg => {let a = arg.replace(',', ''); if(!isNaN(a) && !numbers.find(b => b === Math.round(a))) {nums++; numbers.push(Math.round(a))} else {if(numbers.find(a => a === Math.round(a))) {nums++}}});
                if(nums == args.length && nums !== 1) {allNum = true;}
            }

            let joiningContent = {
                content: `${ctx.processing} Adding tracks...`,
                embeds: [],
                components: []
            };

            if(!ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`] && Object.keys(ctx.music).find(s => s.startsWith(`search`) && s.endsWith(`-${msg.channel.guild.id}`))) {
                const key = Object.keys(ctx.music).find(s => s.startsWith(`search`) && s.endsWith(`-${msg.channel.guild.id}`));

                const usr = await ctx.utils.pronouns(ctx, key.split(`search`)[1].split(`-`)[0]);

                return msg.reply({
                    content: `${ctx.fail} Only **${ctx.utils.escapeDiscordsFuckingEditing(usr.name)}** can do this right now!`,
                    flags: 64
                })
            }

            if(ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`] && ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].author == msg.author.id && args[0] && (args[0].toLowerCase() == `all` || allNum || (!isNaN(args[0]) && Math.round(args[0]) <= ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].results.length && Math.round(args[0]) >= 1))) {
                if(allNum) {
                    let ms;
                    let totalDur = 0;
                    let length = numbers.length, failedTime = 0, source = `${ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].source.toLowerCase()}`;
                    let pos = null
                    try {
                        ms = await ctx.utils.music.joinChannel(ctx, msg, joiningContent)
                    }catch (e) {return}
                    for (m in numbers) {
                        let song = ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].results[numbers[m]-1];
                        if(Number(song.duration) > msg.author.maxtime) {failedTime++; length--} else {
                            const p = await ctx.music[msg.channel.guild.id].addTrack([`${ctx.utils.escapeDiscordsFuckingEditing(`${song.artists[0]} - ${song.title}`)}`, song.duration, `${song.url}`, `${msg.author.id}`, `${song.thumbnail}`, ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].source == `sp` ? `${song.artists[0]} - ${song.title}` : `${song.id}`, ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].source, (ctx.utils.randomGen(16))]);
                            if(!pos || pos < p) pos = p;
                            totalDur = totalDur + song.duration[0] || song.duration
                        }
                    }
                    if(length === 0 && failedTime !== 0) return ms.edit(`${ctx.fail} ${ctx[source || `file`]} I was unable to add every song! (All of them are longer than ${(await ctx.utils.timeConvert(msg.author.maxtime))})`)
                    if(ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].m.id != msg.id && msg.type != 3) ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].m.delete()
                    let ext1 = ``
                    if(failedTime !== 0) {ext1 = ` (skipped ${failedTime} due to duration limit of ${(await ctx.utils.timeConvert(msg.author.maxtime))})`}
                    console.d(`this is ms`, ms)
                    clearInterval(ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].remove.auto);
                    delete ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`]
                    await (ms.edit || msg.reply)(await ctx.utils.music.getMusicCard(ctx, `${ms.content} added ${ctx[ctx.music[msg.channel.guild.id].queue[pos][6].toLowerCase()]} **${length} tracks**${ext1} \`[${(await ctx.utils.timestampConvert(totalDur))}]\` to the queue, starting ${pos === 0 ? `**now**` : pos === 1 ? `**after this song**` : `at position **${pos}**`}!`, {
                        url: ctx.music[msg.channel.guild.id].queue[pos][2],
                        icon: ctx.music[msg.channel.guild.id].queue[pos][4],
                        title: ctx.music[msg.channel.guild.id].queue[pos][0],
                        username: ctx.bot.users.get(ctx.music[msg.channel.guild.id].queue[pos][3]).username
                    }))
                } else if(!isNaN(args[0])) {
                    let ms;
                    let song = ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].results[Math.round(args[0]) - 1], source = `${ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].source.toLowerCase()}`
                    if(Number(song.duration[0]) > msg.author.maxtime) return ms.edit(`${ctx.fail} ${ctx[source || `file`]} I was unable to add ${ctx.utils.escapeDiscordsFuckingEditing(song.artist + ` - ` + song.title)}! (You can't play songs longer than ${(await ctx.utils.timeConvert(msg.author.maxtime))})`)
                    if(ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].m.id != msg.id && msg.type != 3) ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].m.delete()
                    try {
                        ms = await ctx.utils.music.joinChannel(ctx, msg, joiningContent)
                    }catch (e) {return}
                    let pos = await ctx.music[msg.channel.guild.id].addTrack([`${ctx.utils.escapeDiscordsFuckingEditing(`${song.artists[0]} - ${song.title}`)}`, song.duration, `${song.url}`, `${msg.author.id}`, `${song.thumbnail}`, ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].source == `sp` ? `${song.artists[0]} - ${song.title}` : `${song.id}`, ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].source, (ctx.utils.randomGen(16))])
                    console.d(`this is ms`, ms)
                    clearInterval(ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].remove.auto);
                    delete ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`]
                    await (ms.edit || msg.reply)(await ctx.utils.music.getMusicCard(ctx, `${ms.content} added ${ctx[ctx.music[msg.channel.guild.id].queue[pos][6].toLowerCase()]} **"${ctx.music[msg.channel.guild.id].queue[pos][0]}"** \`[${ctx.utils.timestampConvert(ctx.music[msg.channel.guild.id].queue[pos][1][0])}]\` to the queue, starting ${pos === 0 ? `**now**` : pos === 1 ? `**after this song**` : `at position **${pos}**`}!`, {
                        url: ctx.music[msg.channel.guild.id].queue[pos][2],
                        icon: ctx.music[msg.channel.guild.id].queue[pos][4],
                        title: ctx.music[msg.channel.guild.id].queue[pos][0],
                        username: ctx.bot.users.get(ctx.music[msg.channel.guild.id].queue[pos][3]).username
                    }))
                } else if(args[0] == `all`) {
                    let ms;
                    let songs = ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].results;
                    let length = ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].results.length;
                    let totalDur = 0, failedTime = 0, source = `${ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].source.toLowerCase()}`;
                    let pos = null;
                    try {
                        ms = await ctx.utils.music.joinChannel(ctx, msg, joiningContent)
                    }catch (e) {return}
                    for(i in songs) {
                        let song = ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].results[i];
                        if(Number(song.duration[0]) > msg.author.maxtime) {failedTime++; length--} else {
                            const p = await ctx.music[msg.channel.guild.id].addTrack([`${ctx.utils.escapeDiscordsFuckingEditing(`${song.artists[0]} - ${song.title}`)}`, song.duration, `${song.url}`, `${msg.author.id}`, `${song.thumbnail}`, ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].source == `sp` ? `${song.artists[0]} - ${song.title}` : `${song.id}`, ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].source, (ctx.utils.randomGen(16))]);
                            if(!pos || p < pos) pos = p
                            totalDur = totalDur + song.duration[0] || song.duration
                        }
                    }
                    if(length === 0 && failedTime !== 0) return ms.edit(`${ctx.fail} ${ctx[source || `file`]} I was unable to add every song! (All of them are longer than ${(await ctx.utils.timeConvert(msg.author.maxtime))})`)
                    if(ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].m.id != msg.id && msg.type != 3) ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].m.delete()
                    let ext1 = ``
                    if(failedTime !== 0) {ext1 = ` (skipped ${failedTime} due to duration limit of ${(await ctx.utils.timeConvert(msg.author.maxtime))})`}
                    console.d(`this is ms`, ms)
                    clearInterval(ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].remove.auto);
                    delete ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`]
                    await (ms.edit || msg.reply)(await ctx.utils.music.getMusicCard(ctx, `${ctx[ctx.music[msg.channel.guild.id].queue[pos][6]]} Successfully added **${length} tracks**${ext1} \`[${(await ctx.utils.timestampConvert(totalDur))}]\` to the queue, starting ${pos === 0 ? `**now**` : pos === 1 ? `**after this song**` : `at position **${pos}**`}!`, {
                        url: ctx.music[msg.channel.guild.id].queue[pos][2],
                        icon: ctx.music[msg.channel.guild.id].queue[pos][4],
                        title: ctx.music[msg.channel.guild.id].queue[pos][0],
                        username: ctx.bot.users.get(ctx.music[msg.channel.guild.id].queue[pos][3]).username
                    }))
                }
            } else {
                try {
                    await ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].m.edit({
                        content: `${ctx.fail} Aborted!`,
                        components: [],
                        embeds: [],
                    })
                    clearInterval(ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].remove.auto);
                    delete ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`]
                } catch(e) {}
                if(!args[0] && msg.attachments.size === 0 && ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].paused !== false) {
                    return ctx.cmds.get('pause').func(ctx, msg, args)
                } else if(!args[0] && msg.attachments.size === 0) {
                    if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
                } else {
                    let arg;
                    if(args.length !== 0) {
                        arg = args.join(' ');
                    } else if(msg.attachments.size !== 0) {
                        arg = msg.attachments[0].url
                    }
                    let m;
                    let validate;
                    let info;
                    
                    let playlistthing = async function(url, from) {
                        console.d(from, url)
                        if(from == `sp`) {
                            const type = url.includes(`playlist`) ? `playlist/` : `album/`
                            console.d(type)
                            const id = url.split(`${type}`)[1].split('?')[0].split('/')[0]
                            await ctx.libs.superagent.get(`${ctx.musicApi.location}playlist/spotify/${id}`).set(`auth`, `${ctx.musicApi.key}`).then(r => r.body).then(r => {
                                findSP(ctx, m, r, msg)
                            }).catch(e => {
                                console.de(`failed fetching spotify playlist`, e)
                                if(m) {
                                    return m.edit(`${ctx.fail} There was a problem adding your playlist to the queue!\n${ctx.utils.parseMusicError(ctx, `sp`, e)}`)
                                } else {
                                    return msg.reply(`${ctx.fail} There was a problem adding your playlist to the queue!\n${ctx.utils.parseMusicError(ctx, `sp`, e)}`)
                                }
                            })
                        };
                    }
                    let searchFallback = async function() {
                        m = await msg.reply(`${ctx.processing} Searching for **\`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\`**`);
    
                        console.d(m.edit)
      
                        async function response(res) {
                            console.d(res)
                            if(res && res.top) {
                                arg = res.top; 
                                ctx.utils.music.fetchFromApi(ctx, m, arg.url, msg, arg.from)
                                //ctx.utils.music.findYTBySearch(ctx, m, arg, msg)
                            } else {return await m.edit(`${ctx.fail} I was unable to search for **\`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\`**!\n${ctx.utils.parseMusicError(ctx, `yt`, new Error(404))}`)}
                        }
                        
                        ctx.libs.superagent.get(`${ctx.musicApi.location}search/${encodeURI(args.join(` `))}`).set('auth', `${ctx.musicApi.key}`).then(r => {console.d(r.body); return r.body.results}).then(r => {
                            response(r)
                        }).catch(e => {
                            console.error(e)
                            return m.edit(`${ctx.fail} I was unable to search for **\`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\`**!\n${ctx.utils.parseMusicError(ctx, `yt`, e)}`)
                        })
                    }
    
                    if(ctx.utils.music.regex.url.test(arg)) {
                        console.d(`URL detected!`)
                        const ytsub = /(m\.|music\.)(youtube\.com|youtu\.be)/
                        const scsub = /(m\.)(soundcloud\.com)/
                        /*if((ctx.utils.music.regex.ytplaylist.test(arg) || ctx.utils.music.regex.youtube.test(arg)) && ytsub.test(arg)) {arg = arg.replace(ytsub, `www.youtube.com`)}
                        if((ctx.utils.music.regex.scplaylist.test(arg) || ctx.utils.music.regex.soundcloud.test(arg)) && scsub.test(arg)) {arg = arg.replace(scsub, `soundcloud.com`)}
                        if(ctx.utils.music.regex.ytplaylist.test(arg)) {
                            m = await msg.reply(`${ctx.processing} Adding playlist \`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\``)
                            playlistthing(arg, `yt`)
                        } else if(ctx.utils.music.regex.youtube.test(arg)) {
                            if(arg.includes('list=') && ctx.utils.music.regex.ytplaylist.test(`https://www.youtube.com/playlist?list=` + arg.split('list=')[1].split(`&`)[0])) {
                                m = await msg.reply(`${ctx.processing} Adding playlist \`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\``)
                                playlistthing(`https://www.youtube.com/playlist?list=` + arg.split('&list=')[1], `yt`)
                            } else {
                                m = await msg.reply(`${ctx.processing} Adding song \`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\``);
                                if(arg.includes(`youtu.be`)) arg = `https://youtube.com/watch?v=${arg.split('youtu.be/')[1]}`;
                                if(arg.includes(`&v=`)) arg = `https://youtube.com/watch?v=${arg.split(`&v=`)[1].split(`&`)[0]}`;
                                arg = arg.split(`&`)[0]
                                ctx.utils.music.fetchFromApi(ctx, m, arg, msg)
                            }
                        } else if(ctx.utils.music.regex.scplaylist.test(arg)) {
                            m = await msg.reply(`${ctx.processing} Adding set \`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\``)
                            playlistthing(arg, `sc`)
                        } else */{
                            m = await msg.reply(`${ctx.processing} Adding song \`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\``)
                            ctx.utils.music.fetchFromApi(ctx, m, arg, msg)
                        }
                    } else searchFallback()
    
                    /*if(ctx.utils.music.regex.url.test(arg)) {
                        const ytsub = /(m\.|music\.)(youtube\.com|youtu\.be)/
                        const scsub = /(m\.)(soundcloud\.com)/
                        if((ctx.utils.music.regex.ytplaylist.test(arg) || ctx.utils.music.regex.youtube.test(arg)) && ytsub.test(arg)) {arg = arg.replace(ytsub, `www.youtube.com`)}
                        if((ctx.utils.music.regex.scplaylist.test(arg) || ctx.utils.music.regex.soundcloud.test(arg)) && scsub.test(arg)) {arg = arg.replace(scsub, `soundcloud.com`)}
                        if(ctx.utils.music.regex.ytplaylist.test(arg)) {
                            m = await msg.reply(`${ctx.processing} Adding playlist \`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\``)
                            playlistthing(arg, `yt`)
                        } else if(ctx.utils.music.regex.youtube.test(arg)) {
                            if(arg.includes('list=') && ctx.utils.music.regex.ytplaylist.test(`https://www.youtube.com/playlist?list=` + arg.split('list=')[1].split(`&`)[0])) {
                                m = await msg.reply(`${ctx.processing} Adding playlist \`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\``)
                                playlistthing(`https://www.youtube.com/playlist?list=` + arg.split('&list=')[1], `yt`)
                            } else {
                                m = await msg.reply(`${ctx.processing} Adding song \`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\``);
                                if(arg.includes(`youtu.be`)) arg = `https://youtube.com/watch?v=${arg.split('youtu.be/')[1]}`;
                                if(arg.includes(`&v=`)) arg = `https://youtube.com/watch?v=${arg.split(`&v=`)[1].split(`&`)[0]}`;
                                arg = arg.split(`&`)[0]
                                ctx.utils.music.fetchFromApi(ctx, m, arg, msg)
                            }
                        } else if(ctx.utils.music.regex.discordfile.test(arg)) {
                            m = await msg.reply(`${ctx.processing} Adding file \`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\``)
                            ctx.utils.music.fileShit(ctx, m, arg, msg)
                        } else if(ctx.utils.music.regex.scplaylist.test(arg)) {
                            m = await msg.reply(`${ctx.processing} Adding set \`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\``)
                            playlistthing(arg, `sc`)
                        } else if(ctx.utils.music.regex.soundcloud.test(arg)) {
                            m = await msg.reply(`${ctx.processing} Adding song \`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\``)
                            ctx.utils.music.fetchFromApi(ctx, m, arg, msg)
                        } else if(ctx.utils.music.regex.spotifyplaylist.test(arg)) {
                            m = await msg.reply(`${ctx.processing} Adding playlist \`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\``)
                            playlistthing(arg, `sp`)
                        } else if(ctx.utils.music.regex.spotify.test(arg)) {
                            m = await msg.reply(`${ctx.processing} Adding song \`${ctx.utils.escapeDiscordsFuckingEditing(arg)}\``)
                            findSP(ctx, m, arg, msg)
                        } else searchFallback()
                    } else searchFallback()*/
                }
            }
        }
    }
}
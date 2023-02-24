module.exports = {
    "name": "spsearch",
    "desc": "Search on Spotify for a song!",
    "args": [
        {
            "opt": false,
            "arg": "song to look up"
        }
    ],
    "aliases": [
        "searchsp",
        "sps",
        "ssp",
        "spotify",
        "sp"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "song",
                "description": "The song to look up",
                "required": true
            }
        ]
    },
    func: async function spsearch(ctx, msg, args) {
        try {
            await ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].m.edit({
                content: `${ctx.fail} Aborted!`,
                components: [],
                embeds: [],
            })
            clearInterval(ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].remove.auto);
            delete ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`]
        } catch(e) {};
        if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.cmd} <query>\``);
        if(ctx.utils.music.regex.spotify.test(args[0]) || ctx.utils.music.regex.spotifyplaylist.test(args[0])) return ctx.cmds.get('play').func(ctx, msg, args);
        let m = await msg.reply(`${ctx.processing} Searching for **${ctx.utils.escapeDiscordsFuckingEditing(args.join(' '))}**...`)
        ctx.libs.superagent.get(`${ctx.musicApi.location}search/spotify/${encodeURI(args.join(' '))}`).set('auth', `${ctx.musicApi.key}`).then(r => r.body.results).then(async r => {
            if(r.length === 0) {return await m.edit(`${ctx.fail} I was unable to search for **${ctx.utils.escapeDiscordsFuckingEditing(args.join(' '))}**!\n${ctx.utils.parseMusicError(ctx, `sp`, e)}`)}
            ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`] = {source: `sp`, results: [], author: msg.author.id, timeout: 30000};
            let result; let count = 0;
            r.forEach(async res => {
                count++
                let title = res.title, artist = res.artists.length === 1 ? `${res.artists[0]}` : `${res.artists.join(`, `)}`, duration = res.duration, url = res.url, thumbnail = res.thumbnail, id = res.id; playURL = res.play
                if(r.length === 1) {
                    if(Number(duration[0]) > msg.author.maxtime) return m.edit(`${ctx.fail} ${ctx.sp} I was unable to add ${ctx.utils.escapeDiscordsFuckingEditing(artist + ` - ` + title)}! (You can't play songs longer than ${(await ctx.utils.timeConvert(msg.author.maxtime))})`)
                    try {
                        m = await ctx.utils.music.joinChannel(ctx, msg, m);
                    } catch(e) {return}
                    let pos = await ctx.music[msg.channel.guild.id].addTrack([`${artist} - ${title}`, duration, url, msg.author.id, thumbnail, id, `sp`, ctx.utils.randomGen(16)])
                    delete ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`] 
                    return await m.edit(await ctx.utils.music.getMusicCard(ctx, `${m.content} added ${ctx.sp} **"${ctx.music[msg.channel.guild.id].queue[pos][0]}"** \`[${ctx.utils.timestampConvert(ctx.music[msg.channel.guild.id].queue[pos][1][0] || ctx.music[msg.channel.guild.id].queue[pos][1])}]\` to the queue, starting ${pos === 0 ? `**now**` : pos === 1 ? `**after this song**` : `at position **${pos}**`}!`, {
                        url: ctx.music[msg.channel.guild.id].queue[pos][2],
                        icon: ctx.music[msg.channel.guild.id].queue[pos][4],
                        title: ctx.music[msg.channel.guild.id].queue[pos][0],
                        username: ctx.bot.users.get(ctx.music[msg.channel.guild.id].queue[pos][3]).username
                    }))
                } else {
                    ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].results.push(res);
                    let built = `[${count}] (${artist}) ${title}`
                    if(!result) {
                        result = built
                    } else {
                        result = result + `\n\n` + built
                    }
                }
            });
            if(r.length !== 1) {
                ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].m = await m.edit({
                    content: `\`\`\`css\n${result}\`\`\`\n${ctx.sp} ${ctx.utils.music.playText(msg.prefix, count)}`,
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: 1,
                                    emoji: {
                                        name: ctx.emoji.nyx.sing.split(`:`).slice(1,2)[0],
                                        id: ctx.emoji.nyx.sing.split(`:`).slice(2,3)[0].split(`>`)[0],
                                    },
                                    label: `Add every song to queue!`,
                                    customID: "play-all",
                                    disabled: false,
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].results.slice(0, 5).map((o, index) => {
                                return {
                                    type: 2,
                                    style: 2,
                                    label: `Play ${o.title.length > 50 ? `${o.title.substring(0, 45)}...` : o.title}`,
                                    customID: `play-${index+1}`,
                                    disabled: false,
                                }
                            })
                        }
                    ]
                });
                ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].remove = {
                    auto: setTimeout(async function() {
                        if(ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`]) {
                            clearInterval(ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].remove.auto);
                            ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].remove.finish(1)
                        }
                    }, ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].timeout),
                    finish: async function(arg) {
                        clearInterval(ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].remove.auto);
                        delete ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`]
                        if(arg == 1) {return await m.edit({
                            content: `${ctx.fail} You didn't pick a song in enough time!`,
                            components: []
                        })}
                    }
                }
            }
        }).catch(e => {
            return m.edit(`${ctx.fail} I was unable to search for **${ctx.utils.escapeDiscordsFuckingEditing(args.join(' '))}**!\n${ctx.utils.parseMusicError(ctx, `sp`, e)}`)
        })
    }
}
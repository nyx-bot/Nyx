module.exports = {
    "name": "lyrics",
    "desc": "Find the lyrics of a song that is currently playing or searched!",
    "args": [
        {
            "opt": true,
            "arg": "song to look up"
        }
    ],
    "aliases": [
        "ly"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "name",
                "description": "The name of the song to look up",
                "required": false
            }
        ]
    },
    func: async function lyrics (ctx, msg, args) {
        let string;
        if(args[0]) {string = args.join(" ")} else {
            if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].connection) return msg.reply(`${ctx.fail} I'm not playing anything!`)
            let np = ctx.music[msg.channel.guild.id].queue[0];
            string = np[0]
        }
        let origstring = string;
        let m = await msg.reply(`${ctx.processing} Searching lyrics for **${ctx.utils.escapeDiscordsFuckingEditing(origstring)}**...`)
        ctx.libs.superagent.get(`${ctx.musicApi.location}lyrics/${encodeURI(string.replace(/\([^)]*\)|\[[^\]]*\]/g, ``))}`).set('auth', `${ctx.musicApi.key}`).then(async raw => {
            const r = raw.body;
            console.d(raw.text, r, typeof r, typeof r.lyrics)
            if(typeof r !== `object` || !r.lyrics) return m.edit(`${ctx.fail} I couldn't find any lyrics for **${ctx.utils.escapeDiscordsFuckingEditing(origstring)}**!\n${ctx.utils.parseMusicError(ctx, `ly`, e)}`);
            console.d(`passes checks`)
            let desc = ``;
            desc = `**${r.artist}** - ${r.title}`
            let messageCount = Math.floor(r.lyrics.length/3500)+1, count = 0, leftover = ``;
            let lyr, color = ctx.utils.colors(`random`);
            console.d(`message count: ${messageCount};\nlyrics length: ${r.lyrics.length};\nraw: ${(r.lyrics.length/1200)+1};`)
            if(messageCount !== 1) {
                while(count !== messageCount) {
                    count++
                    const end   = (3500*count)
                    const start = 3500*(count-1)
                    const seg = r.lyrics.substring(start, end);
                    const l = seg.split(`\n`)
    
                    const pendingLeft = l.pop();
    
                    if(count === 1) {
                        let embed = {
                            title: desc,
                            description: `${leftover}${l.join(`\n`)}`,
                            color,
                            footer: {text: `( Section ${count} / ${messageCount} )`}
                        }; await m.edit({embed, content: `<:NyxSing:942164350649663499> Lyrics of **${ctx.utils.escapeDiscordsFuckingEditing(origstring)}**`})
                    } else {
                        let embed = {
                            description: `${leftover}${l.join(`\n`)}`,
                            color,
                            footer: {text: `( Section ${count} / ${messageCount} )`}
                        }; await msg.channel.createMessage({embed, forceNewMessage: true})
                    }; leftover = pendingLeft;
                }
            } else {
                let embed = {
                    title: desc,
                    description: `${r.lyrics}`,
                    color: ctx.utils.colors(`random`),
                };
                return m.edit({embed, content: `<:NyxSing:942164350649663499> Lyrics of **${ctx.utils.escapeDiscordsFuckingEditing(origstring)}**`})
            }
        }).catch(async e => {
            console.e(`failed to get lyrics`, e)
            return m.edit(`${ctx.fail} I couldn't find any lyrics for **${ctx.utils.escapeDiscordsFuckingEditing(origstring)}**!\n${ctx.utils.parseMusicError(ctx, `ly`, e)}`);
        })
    }
}
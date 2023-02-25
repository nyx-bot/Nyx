module.exports = {
    "name": "createytmix",
    "desc": "Add a YouTube mix playlist from the current song!",
    "args": [],
    "permission": 3,
    "aliases": [
        "ytmix",
        "addytmix",
        "generateytmix",
        "youtubemix"
    ],
    func: async function createmix (ctx, msg, args) {
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue || !ctx.music[msg.channel.guild.id].queue[0] || !ctx.music[msg.channel.guild.id].queue[0][2]) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}
        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}

        const m = await msg.reply(`${ctx.processing} Creating ${ctx.yt} Mix...`);

        require(`superagent`).get(ctx.config.musicApi.location + `createYoutubeMix/${ctx.music[msg.channel.guild.id].queue[0][2]}`).set(`authorization`, ctx.config.musicApi.key).then(r => {
            console.d(r.body);

            if(msg.type == 3) {
                const func = (...content) => msg.editOriginal(...ctx.core.parseReplyContent({msg, content}));

                msg.reply = func
                msg.edit = func
                m.reply = func
                m.edit = func

                m.content = `${ctx.processing} Adding ${ctx.yt} Mix to queue...`;
                msg.content = `${ctx.processing} Adding ${ctx.yt} Mix to queue...`;
            }

            ctx.utils.music.fetchFromApi(ctx, msg, r.body.url, msg)
        }).catch(e => {
            console.de(e)
            msg.reply(`${ctx.fail} I was unable to create a YouTube playlist from this song! (${e.body && e.body.error ? e.body.message : `An internal error occurred`})`)
        })
    }
}
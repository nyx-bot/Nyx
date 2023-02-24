module.exports = {
    "name": "pause",
    "desc": "Pause the currently playing song!",
    "args": [],
    "aliases": [
        "stop"
    ],
    "interactionObject": {},
    func: async function pause(ctx, msg, args) {
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue || ctx.music[msg.channel.guild.id].onHold.s === true || ctx.music[msg.channel.guild.id].queue.length === 0) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}
        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
        if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue.length === 0) return msg.reply(`${ctx.fail} There's nothing in the queue!`)

        msg.editHijackedFunc = (...a) => new Promise(async (res, rej) => msg.reply(...a).then(m => {
            res(m)
            if(msg.type === 3 && ctx.music[msg.channel.guild.id].nowPlayingUpdate && ctx.music[msg.channel.guild.id].nowPlayingUpdate.msg) ctx.music[msg.channel.guild.id].nowPlayingUpdate.msg = m
        }).catch(e => {
            rej(e)
        }))

        if(ctx.music[msg.channel.guild.id].paused === false) {
            await ctx.music[msg.channel.guild.id].pause()
            let np = ctx.music[msg.channel.guild.id].queue[0];
            ctx.music[msg.channel.guild.id].forceUpdateNowPlaying(true)
            return msg.reply(`:pause_button: Paused **${ctx.utils.escapeDiscordsFuckingEditing(np[0])}**`)
        } else {
            await ctx.music[msg.channel.guild.id].resume()
            let np = ctx.music[msg.channel.guild.id].queue[0]
            ctx.music[msg.channel.guild.id].forceUpdateNowPlaying(true)
            return msg.reply(`:arrow_forward: Resumed **${ctx.utils.escapeDiscordsFuckingEditing(np[0])}**`)
        }
    }
}
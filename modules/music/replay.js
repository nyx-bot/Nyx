module.exports = {
    "name": "replay",
    "desc": "Replay the current song!",
    "args": [],
    "aliases": [
        "restart"
    ],
    "interactionObject": {},
    func: async function replay(ctx, msg, args) {
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue || ctx.music[msg.channel.guild.id].onHold.s === true || ctx.music[msg.channel.guild.id].queue.length === 0) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}
        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
        const a = ctx.music[msg.channel.guild.id].nextTrack('skipto', ctx.music[msg.channel.guild.id].lastPlayed)
        if(a === false) return msg.reply(`${ctx.fail} Wait for the current song to load!`)

        return msg.reply(`<:NyxSing:942164350649663499> Restarted the current song!`)
    }
}
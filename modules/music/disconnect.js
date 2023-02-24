module.exports = {
    "name": "disconnect",
    "desc": "Leave the voice channel and clear the queue!",
    "args": [],
    "permission": 3,
    "aliases": [
        "end",
        "leave",
        "dis",
        "dc"
    ],
    "interactionObject": {},
    func: async function leave (ctx, msg, args) {
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}
        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
        await ctx.music[msg.channel.guild.id].end(msg, msg.channel)
    }
}
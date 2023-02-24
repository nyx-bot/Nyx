module.exports = {
    "name": "shuffle",
    "desc": "Shuffle the current queue!",
    "args": [],
    "permission": 3,
    "aliases": [
        "randomize",
        "randomizequeue",
        "randomqueue",
        "shufflequeue"
    ],
    "interactionObject": {},
    func: async function shuffle(ctx, msg, args) {
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue || ctx.music[msg.channel.guild.id].onHold.s === true || ctx.music[msg.channel.guild.id].queue.length === 0) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}
        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
        let firstsong = ctx.music[msg.channel.guild.id].queue.shift()
        for(let i = ctx.music[msg.channel.guild.id].queue.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * i)
            const temp = ctx.music[msg.channel.guild.id].queue[i]
            ctx.music[msg.channel.guild.id].queue[i] = ctx.music[msg.channel.guild.id].queue[j], ctx.music[msg.channel.guild.id].queue[j] = temp
        }
        ctx.music[msg.channel.guild.id].queue.unshift(firstsong)
        ctx.music[msg.channel.guild.id].fetchNextTracks()
        return msg.reply(`${ctx.pass} Shuffled the queue!`)
    }
}
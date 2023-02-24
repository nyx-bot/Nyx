module.exports = {
    "name": "queue",
    "desc": "Check the current queue!",
    "args": [
        {
            "opt": true,
            "arg": "page number"
        }
    ],
    "aliases": [
        "q",
        "songlist",
        "playinglist"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 4,
                "name": "page",
                "description": "The page number of the queue",
                "required": false
            }
        ]
    },
    func: async function queue(ctx, msg, args) {
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue || ctx.music[msg.channel.guild.id].onHold.s === true || ctx.music[msg.channel.guild.id].queue.length === 0) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}
        if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue.length === 0) return msg.reply(`${ctx.fail} There's nothing in the queue!`)
        // if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
    
        ctx.utils.music.queueFunc(ctx, msg, `new`)
    }
}
module.exports = {
    "name": "loop",
    "desc": "Set the queue or current song to be looped!",
    "args": [
        {
            "opt": true,
            "arg": "song / queue"
        }
    ],
    "permission": 3,
    "aliases": [
        "repeat"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 1,
                "name": "song",
                "description": "Loop the current song"
            },
            {
                "type": 1,
                "name": "queue",
                "description": "Loop the current queue"
            }
        ]
    },
    func: async function loop(ctx, msg, args) {
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}
        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
        if(!args[0] || args[0].toLowerCase() == 'queue') {
            if(ctx.music[msg.channel.guild.id].loop === true) {ctx.music[msg.channel.guild.id].loop = false} else {ctx.music[msg.channel.guild.id].loop = true}
            if(ctx.music[msg.channel.guild.id].singleLoop === true) ctx.music[msg.channel.guild.id].singleLoop = false;
            ctx.music[msg.channel.guild.id].forceUpdateNowPlaying(true)
            if(ctx.music[msg.channel.guild.id].loop === true) {
                return await msg.reply(`🔁 Successfully enabled repeat for this channel!`)
            } else {
                return await msg.reply(`🔁 Successfully disabled repeat for this channel!`)
            }
        } else if(args[0].toLowerCase() == 'song') {
            if(ctx.music[msg.channel.guild.id].singleLoop === true) {ctx.music[msg.channel.guild.id].singleLoop = false} else {ctx.music[msg.channel.guild.id].singleLoop = true}
            if(ctx.music[msg.channel.guild.id].loop === true) ctx.music[msg.channel.guild.id].loop = false;
            ctx.music[msg.channel.guild.id].forceUpdateNowPlaying(true)
            if(ctx.music[msg.channel.guild.id].singleLoop === true) {
                return await msg.reply(`🔂 Successfully enabled repeat for this song!`)
            } else {
                return await msg.reply(`🔂 Successfully disabled repeat for this song!`)
            }
        }
    
    }
}
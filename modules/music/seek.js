module.exports = {
    "name": "seek",
    "desc": "Seek to a certain point of a song!",
    "args": [
        {
            "opt": false,
            "arg": "timestamp"
        }
    ],
    "aliases": [],
    "permission": 3,
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "time",
                "description": "The timestamp to seek to!",
                "required": true
            }
        ]
    },
    func: async function seek(ctx, msg, args) {
        if(!args) args = msg.args
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue || ctx.music[msg.channel.guild.id].onHold.s === true || ctx.music[msg.channel.guild.id].queue.length === 0) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}
        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
        if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue.length === 0) return msg.reply(`${ctx.fail} There's nothing in the queue!`)
        if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue[0] && ctx.music[msg.channel.guild.id].queue[0][1] && ctx.music[msg.channel.guild.id].queue[0][1][0] == null) return msg.reply(`${ctx.fail} You can't seek on livestreams!`)
        if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
    
        const obj = await ctx.utils.getTimeFromArg(typeof msg.data == `object` && msg.data.options && msg.data.options.find(o => o.name == `time`) ? msg.data.options.find(o => o.name == `time`).value.split(` `) : args);
    
        let num = ctx.utils.time(obj.time ? obj.time + (ctx.music[msg.channel.guild.id].paused && ctx.music[msg.channel.guild.id].paused.time ? ctx.music[msg.channel.guild.id].paused.time : Date.now())-ctx.music[msg.channel.guild.id].startedTime : args[0]);
        
        if(num.units.ms <= 0) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``);
    
        if(num.units.ms > ctx.music[msg.channel.guild.id].nowPlayingEnd - ctx.music[msg.channel.guild.id].startedTime) return msg.reply(`You cannot seek to a time that is past the song! (You can \`${msg.prefix}skip\` it instead!)`)
        if(num.units.ms < 0) return msg.reply(`You cannot seek to 0 seconds or before! (You can \`${msg.prefix}restart\` it instead!)`)
        if(num.timestamp == `--:--`) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``);
    
        const m = await msg.reply(`${ctx.processing} Seeking to \`${num.timestamp}\``);
    
        await ctx.music[msg.channel.guild.id].seek(num.timestamp);
    
        return await m.edit(`<:NyxSing:942164350649663499> Successfully seeked to \`${num.timestamp}\`!`)
    }
}
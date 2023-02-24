module.exports = {
    "name": "volume",
    "desc": "Set the volume for the current queue!",
    "args": [
        {
            "opt": false,
            "arg": "percentage of new volume; range of 0 - 250"
        }
    ],
    "permission": 3,
    "aliases": [
        "vol"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 4,
                "name": "percentage",
                "description": "The new volume percentage. (0 - 250)",
                "required": true
            }
        ]
    },
    func: async function volume(ctx, msg, args) {
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}
        if(!args[0]) return msg.reply(`Currently, the volume is set to **${((ctx.music[msg.channel.guild.id].connection.volume*100))}%**`)
        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
            if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
        let num = Math.round(args[0])
        if(num < 0) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
        let usableNum = num/100
        if(num <= 251) {
            await ctx.music[msg.channel.guild.id].connection.setVolume(usableNum)
            return msg.reply(`<:NyxSing:942164350649663499> Volume set to **${num}%**`)
        } else {
            return msg.reply(`${ctx.fail} You can only set the volume **up to 251%**!`)
        }
    }
}
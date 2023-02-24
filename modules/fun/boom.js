module.exports = {
    "name": "boom",
    "desc": "play a vine boom sound effect in your voice channel.",
    "args": [],
    "aliases": [
        "boomsound",
        "vineboom"
    ],
    "interactionObject": {},
    func: async function(ctx, msg, args) {
        if(ctx.music[msg.channel.guild.id]) return msg.reply(`${ctx.fail} I can't do this while I am in a channel for music!`)
        if(msg.channel.guild.me.voiceState) return msg.reply(`${ctx.fail} I'm already in another voice channel!`)
        if(!msg.member.voiceState) return msg.reply(`${ctx.fail} You're not in a voice channel!`)
        let file = `./res/sound-effects/boom.mp3`
        await ctx.bot.joinVoiceChannel(msg.member.voiceState.channelID).then(async connection => {
            let dispatcher = await connection.play(file);
            connection.on(`end`, async () => {
                msg.channel.guild.leaveVoiceChannel()
            })
        })
    }
}
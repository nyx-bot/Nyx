module.exports = {
    "name": "oof",
    "desc": "play an oof sound effect in your voice channel.",
    "args": [],
    "aliases": [
        "oofsound"
    ],
    "interactionObject": {},
    func: async function(ctx, msg, args) {
        if(ctx.music[msg.channel.guild.id]) return msg.reply(`${ctx.fail} I can't do this while I am in a channel for music!`)
        if(msg.channel.guild.me.voiceState) return msg.reply(`${ctx.fail} I'm already in another voice channel!`)
        if(!msg.member.voiceState) return msg.reply(`${ctx.fail} You're not in a voice channel!`)
        let file = `./res/sound-effects/oof.mp3`
        let chances = [true, false, false, true, false, false, false, false, false];
        if(chances[Math.floor((Math.random() * chances.length))] === true) {
            let rareSounds = []
            ctx.libs.fs.readdir('./res/sound-effects/oof/', (err, files) => {
                file = `./res/sound-effects/oof/${files[Math.floor((Math.random() * files.length))]}`
            });
        }
        await ctx.bot.joinVoiceChannel(msg.member.voiceState.channelID).then(async connection => {
            let dispatcher = await connection.play(file);
            connection.on(`end`, async () => {
                msg.channel.guild.leaveVoiceChannel()
            })
        })
    }
}
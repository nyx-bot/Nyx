module.exports = {
    "name": "nowplaying",
    "desc": "See what is currently playing in the voice channel!",
    "args": [],
    "aliases": [
        "np"
    ],
    "interactionObject": {},
    func: async function nowplaying(ctx, msg, args, noSendMsg, noCreateTimer) {
        const updateArgs = [ctx, noSendMsg ? (ctx.music[msg.channel.guild.id].nowPlayingUpdate || {msg}).msg : msg, 'edit']

        if(noSendMsg != true) {
            if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}
            // if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
            ctx.utils.music.nowPlayingFunc(ctx, msg);
        } else {
            console.d(`Not sending a message for nowplaying func. Updating original.`);

            if(updateArgs[1].editOriginal) {
                updateArgs[1].reply = updateArgs[1].editOriginal;
            };

            if(updateArgs[1].message && updateArgs[1].editOriginal) {
                updateArgs[1].message.reply = updateArgs[1].editOriginal
            }

            if(ctx.music[msg.channel.guild.id].nowPlayingUpdate) ctx.utils.music.nowPlayingFunc(...updateArgs)
        }

        if(ctx.music[msg.channel.guild.id].npUpdateTask) clearInterval(ctx.music[msg.channel.guild.id].npUpdateTask);

        if(noCreateTimer != true) {
            const int = setInterval(async function() {
                if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].nowPlayingUpdate) {
                    ctx.utils.music.nowPlayingFunc(...updateArgs)
                } else {
                    if(!ctx.music[msg.channel.guild.id]) {
                        clearInterval(int)
                    }
                }
            }, 10000); ctx.music[msg.channel.guild.id].npUpdateTask = int;
    
            console.d(`[nowplaying] created new interval!`)
        }
    }
}
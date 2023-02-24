module.exports = {
    "name": "clearqueue",
    "desc": "Remove every track after the current song!",
    "args": [],
    "aliases": [
        "cq",
        "clearall",
        "clean",
        "cleanqueue"
    ],
    "permission": 3,
    "interactionObject": {},
    func: async function clearqueue(ctx, msg, args) {
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}
        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
        if(ctx.music[msg.channel.guild.id].queue.length === 0) {
            return msg.reply(`${ctx.fail} You can't clear an empty queue!`)
        } else if(ctx.music[msg.channel.guild.id].queue.length === 1) {
            let m = await msg.reply(`${ctx.pass} Successfully cleared the queue`);
            ctx.music[msg.channel.guild.id].queue.shift();
            const skip = await ctx.music[msg.channel.guild.id].nextTrack('skipto');
        } else if(ctx.music[msg.channel.guild.id].queue.length > 1) {
            const t1JRuYcDcmXWky8CyvW79pq1qxePi72FucuiGx9BPt = ctx.music[msg.channel.guild.id].queue.length - 1;
            ctx.music[msg.channel.guild.id].queue.splice(1, t1JRuYcDcmXWky8CyvW79pq1qxePi72FucuiGx9BPt);
            let m = await msg.reply(`${ctx.pass} Successfully cleared the queue`);
        }
    }
}
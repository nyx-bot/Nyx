module.exports = {
    "name": "leavecleanup",
    "desc": "Remove songs from people who have left the voice channel!",
    "args": [],
    "permission": 3,
    "aliases": [
        "lc"
    ],
    "interactionObject": {},
    func: async function leavecleanup (ctx, msg, args) {
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue || ctx.music[msg.channel.guild.id].onHold.s === true || ctx.music[msg.channel.guild.id].queue.length === 0) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}
        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
        const newQueue = ctx.music[msg.channel.guild.id].queue.filter(s => ctx.music[msg.channel.guild.id].channel.voiceMembers.has(s[3]) || ctx.music[msg.channel.guild.id].queue[0][7] == s[7])
        let origLength = ctx.music[msg.channel.guild.id].queue.length;
        let newLength = newQueue.length
        if(origLength === newLength) {
            return msg.reply(`${ctx.fail} Nothing was removed!`)
        } else {
            ctx.music[msg.channel.guild.id].queue = newQueue;
            let difference = (origLength - newLength)
            let suffix = 's'
            if(difference === 1) suffix = ''
            return msg.reply(`${ctx.pass} Successfully removed **${difference}** song${suffix}!`)
        }
    }
}
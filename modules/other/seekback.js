module.exports = {
    "name": "seekback",
    "desc": "[Button of nowplaying func] -- seek forward 10 seconds",
    func: async function seekForward(ctx, msg, args) {
        const oldTime = ctx.utils.time(Date.now()-ctx.music[msg.channel.guild.id].startedTime).timestamp;
        const newTime = ctx.utils.time(Date.now()-ctx.music[msg.channel.guild.id].startedTime - 30000).timestamp;
        console.log(`Seeking from ${oldTime} to ${newTime}`)
        args = [newTime]; msg.args = [newTime]
        ctx.cmds.get(`seek`).func(ctx, msg, args)
    }
}
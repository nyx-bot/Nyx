const fs = require('fs')

module.exports = (ctx) => new Promise(async res => {
    if(fs.existsSync(`./etc/musicSessions/`) && fs.readdirSync(`./etc/musicSessions/`).length > 0) {
        const sessions = fs.readdirSync(`./etc/musicSessions/`);
        for(s of sessions) {
            try {
                const obj = require(`../etc/musicSessions/${s}`);

                fs.rmSync(`./etc/musicSessions/${s}`);
                
                let msg = ctx.core.commandHandler(ctx, await ctx.bot.rest.channels.getMessage(obj.channel, obj.message), true);

                console.log(`Restarting music session ${s}...`);

                await new Promise(async res => {
                    await ctx.utils.music.joinChannel(ctx, msg, `I've finished restarting!\n\nGive me a few seconds to continue your queue!`, obj.voiceChannel);
                    await ctx.music[msg.channel.guild.id].addTrack(obj.queue);
                    res();
                });
            } catch(e) {
                console.warn(`Couldn't resume music session ${s}: ${e}`)
            }
        }
    }
})
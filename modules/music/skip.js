module.exports = {
    "name": "skip",
    "desc": "(Vote)skip the currently playing song!",
    "args": [],
    "aliases": [
        "s",
        "skipsong"
    ],
    "interactionObject": {},
    func: async function skip(ctx, msg, args) {
        let guildSetting = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue || ctx.music[msg.channel.guild.id].onHold.s === true || ctx.music[msg.channel.guild.id].queue.length === 0) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}
        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
        if(ctx.music[msg.channel.guild.id] && ctx.music[msg.channel.guild.id].queue && ctx.music[msg.channel.guild.id].queue.length === 0) return msg.reply(`${ctx.fail} There's nothing in the queue!`)
        let np = ctx.music[msg.channel.guild.id].queue[0];
        console.d(`Voteskipping for ${msg.channel.guild.id} is ${guildSetting.dataValues.musicVoteSkip ? `enabled` : `disabled`}`)
        if(guildSetting.dataValues.musicVoteSkip) {
            const permission = await ctx.utils.hasPermission(ctx, msg.author.id, msg.channel.guild.id, 3)
            if(permission.result) {
                let m = await msg.reply(`<:NyxSing:942164350649663499> Skipped **${ctx.utils.escapeDiscordsFuckingEditing(np[0])}**`)
                const skip = await ctx.music[msg.channel.guild.id].nextTrack('skip');
            } else {
                let memberCount = Array.from(ctx.music[msg.channel.guild.id].channel.voiceMembers).length - 1
                let chance = (memberCount/2); if(chance < 1) {chance = 1}; chance = Math.floor(chance)
                if(!ctx.music[msg.channel.guild.id].skipCount[msg.author.id]) {
                    ctx.music[msg.channel.guild.id].skipCount.votes++
                    ctx.music[msg.channel.guild.id].skipCount[msg.author.id] = {}
                    if((ctx.music[msg.channel.guild.id].skipCount.votes/chance) >= 1) {
                        const skip = await ctx.music[msg.channel.guild.id].nextTrack('skip');
                        return msg.reply(`${ctx.pass} Skipped **${ctx.utils.escapeDiscordsFuckingEditing(np[0])}**`)
                    } else return await msg.reply({
                        content: `${ctx.pass} You voted to skip this song! (${ctx.music[msg.channel.guild.id].skipCount.votes}/${chance})`,
                        flags: 64,
                    })
                } else {
                    if((ctx.music[msg.channel.guild.id].skipCount.votes/chance) >= 1) {
                        const skip = await ctx.music[msg.channel.guild.id].nextTrack('skip');
                        return msg.reply(`${ctx.pass} Skipped **${ctx.utils.escapeDiscordsFuckingEditing(np[0])}**`)
                    } else {
                        return await msg.reply({
                            content: `${ctx.fail} You already voteskipped this song! (${ctx.music[msg.channel.guild.id].skipCount.votes}/${chance})`,
                            flags: 64,
                        })
                    }
                }
            }
        } else {
            let m = await msg.reply(`${ctx.pass} Skipped **${ctx.utils.escapeDiscordsFuckingEditing(np[0])}**`)
            const skip = await ctx.music[msg.channel.guild.id].nextTrack('skip');
        }
    }
}
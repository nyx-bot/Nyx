function icon(ctx, thing) {if(!thing) {return {icon: ctx.emoji.status.unknown, text: `Inactive (no messages set!)`}} else {return {icon: ctx.emoji.status.available, text: "Active"}}}

module.exports = {
    "name": "welcome",
    "desc": "Check the welcome/leave message settings!",
    "args": [],
    "permission": 1,
    "interactionObject": {},
    func: async function(ctx, msg, args) {
        let guildSetting = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
        if(!args[0]) {
            let welcomeMsgs = JSON.parse(guildSetting.welcomeMsg)
            let leaveMsgs = JSON.parse(guildSetting.leaveMsg)
            let status; if(guildSetting.welcomeMsg || guildSetting.leaveMsg) {status = icon(ctx, 1)} else {status = icon(ctx, 0)}
            let embd = {
                title: `Welcome/Leave Messages`,
                description: `${status.icon} ${status.text}\n**${welcomeMsgs.length}/3** Welcome Messages\n**${leaveMsgs.length}/3** Leave Messages`,
                fields: [],
                color: ctx.utils.colors(`random`),
                footer: {text: `${msg.prefix}help welcome`}
            };
            let suffix;
            if(welcomeMsgs.length !== 0) {suffix = ``}
            if(welcomeMsgs.length !== 1) {suffix = 's'};
            let doneA = 0;
            while(!(doneA === 3)) {
                embd.fields.push({
                    name: `Welcome Message ${doneA+1}`,
                    value: welcomeMsgs[doneA] || `\u200B`,
                    inline: true,
                })
                doneA = doneA + 1
            };
            let doneB = 0;
            while(!(doneB === 3)) {
                embd.fields.push({
                    name: `Leave Message ${doneB+1}`,
                    value: leaveMsgs[doneB] || `\u200B`,
                    inline: true,
                })
                doneB = doneB + 1
            };

            await new Promise(res => {
                require('fs').readdir(`./etc/backgrounds`, async (e, ids) => {
                    if(!e) {
                        console.d(`successfuly searched background!`)
                        const thisServer = ids.find(i => i.startsWith(msg.channel.guild.id))
                        if(thisServer) {
                            embd.image = {
                                url: `https://nyx.bot/api/welcomeBackground/${msg.channel.guild.id}`
                            }
                        };
                        res();
                    }
                });
            })

            return msg.reply({embeds: [embd]})
        };
    }
}
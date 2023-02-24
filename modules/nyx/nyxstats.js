const cp = require('child_process')

module.exports = {
    "name": "nyxstats",
    "desc": "This command shows you the stats of Nyx!",
    "args": [],
    "aliases": [
        "botstats",
        "botinfo",
        "uptime",
        "stats"
    ],
    "interactionObject": {},
    func: async function botInfo(ctx, msg, args) {
        const timeAAA = await ctx.utils.timeConvert(ctx.bot.uptime);
        let suffix = 's';
        if(Object.keys(ctx.music).length === 1) {suffix = ``};
        const pkg = ctx.package;
        let embd = {
            title: `**Nyx's Stats**`,
            description: `**${ctx.utils.escapeDiscordsFuckingEditing(msg.channel.guild.name)}** is on shard **#${msg.channel.guild.shard.id}**`,
            color: ctx.utils.colors('random'),
            fields: [
                {
                    name: `<:NyxSporkle:942164351022927922> Servers`,
                    value: `${ctx.bot.guilds.size}; ${(Object.values(ctx.bot.guildShardMap).filter(a => {if(a === msg.channel.guild.shard.id) {return true} else {return false}})).length} on this shard`,
                    inline: true,
                },
                {
                    name: `<:NyxSylHug:942164350964220024> Users`,
                    value: `${ctx.bot.guilds.reduce((a, b) => a + b.memberCount, 0)} users total`,
                    inline: true,
                },
                {
                    name: `<:NyxMechanic:942164351064875008> System Events`,
                    value: `${ctx.utils.fuckingComma(ctx.eventCountWithinASecond)}/s, ${ctx.utils.fuckingComma(ctx.eventCountWithinAnHour)}/h`,
                    inline: true,
                },
                {
                    name: `<:NyxSing:942164350649663499> Music playing in`,
                    value: `${Object.keys(ctx.music).length} server${suffix} (${Object.values(ctx.music).filter(o => o.queue && typeof o.queue.length == `number`).map(o => o.queue.length).reduce((a,b) => a + b, 0)} songs total)`,
                    inline: true,
                },
                {
                    name: `<:NyxPat:942164350771269662> Version`,
                    value: `${ctx.git.commit}`,
                    inline: true,
                },
                {
                    name: `<:NyxMechanic:942164351064875008> Last Updated`,
                    value: await ctx.utils.timeConvert(Date.now() - ctx.git.lastGitModification.getTime(), true, 2) + ` ago`,
                    inline: true,
                },
                {
                    name: `<:NyxHappy:942164350716764160> Website`,
                    value: `[nyx.bot](https://nyx.bot/)`,
                    inline: true,
                },
                {
                    name: `<:NyxLove:942164350964228167> Invite`,
                    value: `[nyx.bot/i](https://nyx.bot/i)`,
                    inline: true,
                },
                {
                    name: `<:nyxGlow:699353048182685766> Server`,
                    value: `[nyx.bot/server](https://nyx.bot/server)`,
                    inline: true,
                },/*
                {
                    name: `<:NyxMechanic:942164351064875008> Powered by Linode!`,
                    value: `> [**Get $100 in credit for free when you sign up for Linode using my referral!**](https://www.linode.com/lp/refer/?r=b5af259a0c96e896ed5142ea484721cbf1365ae5) When you sign up with my referral and pay your first $25, it supports Nyx as well!\n> *[Read more about it on Linode's website!](https://www.linode.com/referral-program/)*`
                }*/
            ],
        }
        return msg.reply({embeds: [embd]})
    }
}
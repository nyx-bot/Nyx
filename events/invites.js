// everything includes event stuff, ctx, and meta.
async function check(ctx, guild, meta) { const g = await ctx.utils.lookupGuild(ctx, guild); if(g && g.logging === true && g.loggingchannelID !== null && g[`logging${meta}`] !== false && g.loggingchannelWebhook !== `{}`) {return g} else {return false} }

inviteCreate = async function(invite, ctx, meta, mObj) {
    let guild = invite.channel.guild;
    if(guild) try {
        const g = await check(ctx, guild.id, meta)
        if(!g) return ctx.utils.updateGuildInvites({ctx, id: guild.id, purge: true})
        ctx.utils.updateGuildInvites({ctx, id: guild.id, invite})
        const webhook = JSON.parse(g.loggingchannelWebhook);
        let time;
        if(invite.maxAge) {time = await ctx.utils.timeConvert(invite.maxAge*1000)} else {time = `No Limit!`}
        let embd = {
            title: `Invite Created`,
            description: `Created **Invite** to <#${invite.channel.id}>`,
            fields: [
                {
                    name: `Created by:`,
                    value: `<@${invite.inviter.id}>`,
                    inline: true,
                },
                {
                    name: `URL:`,
                    value: `https://discord.gg/${invite.code}`,
                    inline: true,
                },
                {
                    name: `Duration:`,
                    value: `${time}`,
                    inline: true,
                },
            ],
            color: ctx.utils.colors('green')
        };
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

inviteDelete = async function(invite, ctx, meta, mObj) {
    let guild = invite.channel.guild;
    if(guild) try {
        const g = await check(ctx, guild.id, meta)
        if(!g) return ctx.utils.updateGuildInvites({ctx, id: guild.id, purge: true})
        ctx.utils.updateGuildInvites({ctx, id: guild.id})
        const webhook = JSON.parse(g.loggingchannelWebhook)
        let time;
        if(invite.maxAge) {time = await ctx.utils.timeConvert(invite.maxAge*1000)} else {time = `No Limit!`}
        let embd = {
            title: `Invite Removed`,
            description: `Removed **Invite** to <#${invite.channel.id}>`,
            fields: [],
            color: ctx.utils.colors('red')
        };
        if(invite.inviter) {
            embd.fields.push({
                name: `Original creator:`,
                value: `<@${invite.inviter.id}>`,
                inline: true,
            })
        }
        if(invite.code) {
            embd.fields.push({
                name: `URL:`,
                value: `https://discord.gg/${invite.code}`,
                inline: true,
            })
        }
        embd.fields.push({
            name: `Duration:`,
            value: `--`,
            inline: true,
        })
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

module.exports = [
    {
        event: "inviteDelete",
        name: "Invite Deletion",
        func: inviteDelete
    },
    {
        event: "inviteCreate",
        name: "Invite Creation",
        func: inviteCreate
    },
];
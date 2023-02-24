// everything includes event stuff, ctx, and meta.
async function check(ctx, guild, meta) { const g = await ctx.utils.lookupGuild(ctx, guild); if(g && g.logging === true && g.loggingchannelID !== null && g[`logging${meta}`] !== false && g.loggingchannelWebhook !== `{}`) {return g} else {return false} }
function tficon(thing, ctx) {if(!thing) {return {icon: `${ctx.fail}`, text: `Disabled`}} else {return {icon: `${ctx.pass}`, text: "Enabled"}}}

createChannel = async function(channel, ctx, meta, mObj) {
    try {
        if(channel.type === 1 || channel.type === 3) return;
        const g = await check(ctx, channel.guild.id, meta)
        if(!g) return;
        let t = channel.type; let type = ``; let mention = ``
        if(t === 0) {type = `Text Channel`; mention = `<#${channel.id}>`}; if(t === 2) {type = `Voice Channel`; mention = `:speaker: ${channel.name.replace(/\*/g, '\\*')}`}; if(t === 4) {type = `Category`; mention = `"${channel.name.replace(/\*/g, '\\*')}"`}; if(t === 5) {type = `News Channel`; mention = `<#${channel.id}>`}; if(t === 6) {type = `Store Channel`; mention = `<#${channel.id}>`}; 
        const webhook = JSON.parse(g.loggingchannelWebhook)
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [{
                title: `Created Channel`,
                description: `Created **${type}** (${mention})`,
                color: ctx.utils.colors('green')
            }], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

deleteChannel = async function(channel, ctx, meta, mObj) {
    try {
        if(channel.type === 1 || channel.type === 3) return;
        const g = await check(ctx, channel.guild.id, meta)
        if(!g) return;
        let t = channel.type; let type = ``; let mention = ``
        if(t === 0) {type = `Text Channel`; mention = `#${channel.name}`}; if(t === 2) {type = `Voice Channel`; mention = `:speaker: ${channel.name.replace(/\*/g, '\\*')}`}; if(t === 4) {type = `Category`; mention = `"${channel.name.replace(/\*/g, '\\*')}"`}; if(t === 5) {type = `News Channel`; mention = `#${channel.name}`}; if(t === 6) {type = `Store Channel`; mention = `#${channel.name}`}; 
        const webhook = JSON.parse(g.loggingchannelWebhook)
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [{
                title: `Removed Channel`,
                description: `Removed **${type}** (${mention})`,
                color: ctx.utils.colors('red')
            }], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

channelUpdate = async function(channel, changes, ctx, meta, mObj) {
    try {
        if(channel.type === 1 || channel.type === 3) return;
        const g = await check(ctx, channel.guild.id, meta)
        if(!g) return;
        let t = channel.type; let type = ``; let mention = ``
        if(t === 0) {type = `Text Channel`; mention = `#${channel.name}`}; if(t === 2) {type = `Voice Channel`; mention = `:speaker: ${channel.name.replace(/\*/g, '\\*')}`}; if(t === 4) {type = `Category`; mention = `"${channel.name.replace(/\*/g, '\\*')}"`}; if(t === 5) {type = `News Channel`; mention = `#${channel.name}`}; if(t === 6) {type = `Store Channel`; mention = `#${channel.name}`}; 
        
        let fields = [];

        changes.forEach(o => {
            fields.push(
                {
                    name: `Old ${o.key}`,
                    value: o.old_value || `*None!*`,
                    inline: true,
                },
                {
                    name: `New ${o.key}`,
                    value: o.new_value || `*None!*`,
                    inline: true,
                }
            )
        })

        if(fields.length === 0) return;
        
        const webhook = JSON.parse(g.loggingchannelWebhook)
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [{
                title: `Edited Channel`,
                description: `Edited **${type}** (${mention})`,
                fields,
                color: ctx.utils.colors('gold')
            }], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

module.exports = [
    {
        event: "channelCreate",
        name: "Channel Creation",
        func: createChannel
    },
    {
        event: "channelDelete",
        name: "Channel Deletion",
        func: deleteChannel
    },
    /*{
        event: "channelUpdate",
        name: "Channel Deletion",
        func: channelUpdate
    },*/
    {
        event: "guildAuditLogEntryCreate",
        name: "Guild Channel Update Audit Log",
        func: (guild, audit, ctx, meta, mObj) => {
            if(audit.actionType == 11) {
                //console.d(audit)
                channelUpdate(guild.channels.get(audit.targetID), audit.changes, ctx, meta, mObj)
            }
        }
    }
];
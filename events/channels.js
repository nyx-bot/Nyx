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

channelUpdate = async function(channel, oldChannel, ctx, meta, mObj) {
    try {
        if(channel.type === 1 || channel.type === 3) return;
        const g = await check(ctx, channel.guild.id, meta)
        if(!g) return;
        let t = channel.type; let type = ``; let mention = ``
        if(t === 0) {type = `Text Channel`; mention = `#${channel.name}`}; if(t === 2) {type = `Voice Channel`; mention = `:speaker: ${channel.name.replace(/\*/g, '\\*')}`}; if(t === 4) {type = `Category`; mention = `"${channel.name.replace(/\*/g, '\\*')}"`}; if(t === 5) {type = `News Channel`; mention = `#${channel.name}`}; if(t === 6) {type = `Store Channel`; mention = `#${channel.name}`}; 
        let fields = [];
        if(oldChannel.name !== channel.name) {
            fields.push({
                name: `Old Name:`, 
                value: `${oldChannel.name}`, 
                inline: true,
            }); fields.push({
                name: `New Name:`, 
                value: `${channel.name}`, 
                inline: true,
            })
        }; if(oldChannel.parentID !== channel.parentID && (channel.parentID || oldChannel.parentID)) {
            console.d(`old: ${oldChannel.parentID}\nnew: ${channel.parentID}`)
            fields.push({
                name: `Old Category:`, 
                value: `${oldChannel.parentID && channel.guild.channels && channel.guild.channels.find(c => c.id == oldChannel.parentID) ? `${channel.guild.channels.find(c => c.id == oldChannel.parentID).name}` : `*None!*`}`, 
                inline: true,
            }); fields.push({
                name: `New Category:`, 
                value: `${channel.parentID && channel.guild.channels && channel.guild.channels.find(c => c.id == channel.parentID) ? `${channel.guild.channels.find(c => c.id == channel.parentID).name}` : `*None!*`}`, 
                inline: true,
            });
        }; if(oldChannel.topic !== channel.topic && typeof channel.topic == `string`) {
            fields.push({
                name: `Old Description:`, 
                value: `${oldChannel.topic || `*None!*`}`, 
                inline: true,
            }); fields.push({
                name: `New Description:`, 
                value: `${channel.topic || `*None!*`}`, 
                inline: true,
            });
        }; if(oldChannel.nsfw !== channel.nsfw && typeof channel.nsfw == `boolean` && typeof oldChannel.nsfw == `boolean`) {
            fields.push({
                name: `NSFW Toggled:`, 
                value: `${tficon(channel.nsfw, ctx).icon} ${tficon(channel.nsfw, ctx).text}`, 
                inline: true,
            })
        }; if(oldChannel.bitrate !== channel.bitrate && (typeof channel.bitrate == `number` || typeof channel.bitrate == `bigint` || typeof oldChannel.bitrate == `number` || typeof oldChannel.bitrate == `bigint`)) {
            fields.push({
                name: `Old Bitrate:`, 
                value: `${oldChannel.bitrate || `--`}kbps`, 
                inline: true,
            }); fields.push({
                name: `New Bitrate:`, 
                value: `${channel.bitrate || `--`}kbps`, 
                inline: true,
            });}
        if(oldChannel.videoQualityMode !== channel.videoQualityMode && (typeof channel.videoQualityMode == `number` || typeof channel.videoQualityMode == `bigint` || typeof oldChannel.videoQualityMode == `number` || typeof oldChannel.videoQualityMode == `bigint`)) {
            let videoQualityModes = [ `--`, `Auto`, `720p` ]
            fields.push({
                name: `Old Video Quality:`, 
                value: `${oldChannel.videoQualityMode ? videoQualityModes[oldChannel.videoQualityMode] : oldChannel.videoQualityMode[0]}`, 
                inline: true,
            }); fields.push({
                name: `New Video Quality:`, 
                value: `${channel.videoQualityMode ? videoQualityModes[channel.videoQualityMode] : channel.videoQualityMode[0]}`, 
                inline: true,
            });
        }; if(oldChannel.rtcRegion !== channel.rtcRegion && (channel.rtcRegion || oldChannel.rtcRegion)) {
            fields.push({
                name: `Old Voice Region:`, 
                value: `\`${(oldChannel.rtcRegion || channel.guild.region || `--`).toUpperCase().replace(/-/g, ` `)}\``, 
                inline: true,
            }); fields.push({
                name: `New Voice Region:`, 
                value: `\`${(channel.rtcRegion || channel.guild.region || `--`).toUpperCase().replace(/-/g, ` `)}\``, 
                inline: true,
            });
        }; if(oldChannel.rateLimitPerUser !== channel.rateLimitPerUser && (oldChannel.rateLimitPerUser || channel.rateLimitPerUser)) {
            fields.push({
                name: `Old Cooldown:`, 
                value: `${(await ctx.utils.timeConvert(oldChannel.rateLimitPerUser ? oldChannel.rateLimitPerUser*1000 : 0))}`, 
                inline: true,
            }); fields.push({
                name: `New Cooldown:`, 
                value: `${(await ctx.utils.timeConvert(channel.rateLimitPerUser ? channel.rateLimitPerUser*1000 : 0))}`, 
                inline: true,
            });
        }; if(oldChannel.userLimit !== channel.userLimit && typeof (channel.userLimit || oldChannel.userLimit) == `number`) {
            fields.push({
                name: `Old Member Limit:`, 
                value: `${oldChannel.userLimit}`, 
                inline: true,
            }); fields.push({
                name: `New Member Limit:`, 
                value: `${channel.userLimit}`, 
                inline: true,
            });
        }

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
    {
        event: "channelUpdate",
        name: "Channel Deletion",
        func: channelUpdate
    },
];
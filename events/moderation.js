// everything includes event stuff, ctx, and meta.
async function check(ctx, guild, meta) { const g = await ctx.utils.lookupGuild(ctx, guild); if(g && g.logging === true && g.loggingchannelID !== null && g[`logging${meta}`] !== false && g.loggingchannelWebhook !== `{}`) {return g} else {return false} }

userWarn = async function(warn, member, ctx, meta, mObj) {
    try {
        const g = await check(ctx, warn.guild, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook);
        let suffix = 'th'; if(`${warn.warning}` == '1') {suffix = 'st'}; if(`${warn.warning}` == '2') {suffix = 'nd'}; if(`${warn.warning}` == '3') {suffix = 'rd'}; if(warn.warning === 11 || warn.warning === 12 || warn.warning === 13) {suffix = 'th'};
        let embed = {
            title: `Member Warned`,
            description: `**Member:** <@${warn.person}> [${warn.warning}${suffix} warning]\n**Moderator:** <@${warn.moderator}>\n**Reason:**\n> ${warn.reason.replace(/\n/g, '\n> ')}`,
            color: ctx.utils.colors('purple'),
            thumbnail: {url: member.avatarURL()}
        }
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

clearWarnings = async function(warn, member, ctx, meta, mObj) {
    try {
        const g = await check(ctx, warn.guild, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook); let suffix = 's'
        if(warn.deleted === 1) {suffix = ''}
        let embed = {
            title: `Member Warnings Cleared`,
            description: `**Member:** <@${warn.person}> [${warn.deleted} warning${suffix}]\n**Moderator:** <@${warn.moderator}>\n**Reason:**\n> ${warn.reason.replace(/\n/g, '\n> ')}`,
            color: ctx.utils.colors('purple'),
            thumbnail: {url: member.avatarURL()}
        }
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
};

deleteWarning = async function(warn, member, ctx, meta, mObj) {
    try {
        const g = await check(ctx, warn.guild, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook)
        let embed = {
            title: `Member Warning Removed`,
            description: `**Member:** <@${warn.person}> [Warning ${warn.wID}]\n**Moderator:** <@${warn.moderator}>\n**Reason:**\n> ${warn.reason.replace(/\n/g, '\n> ')}\n**Original Warning:**\n> ${warn.object.desc.replace(/\n/g, '\n> ')}`,
            color: ctx.utils.colors('purple'),
            thumbnail: {url: member.avatarURL()}
        }
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

memberKicked = async function(moderator, member, reason, ctx, meta, mObj) {
    try {
        const g = await check(ctx, moderator.guild.id, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook)
        let embed = {
            title: `Member Kicked`,
            description: `**Member:** <@${member.id}> [**${ctx.utils.escapeDiscordsFuckingEditing(`${member.username}#${member.discriminator}`)}**]\n**Moderator:** <@${moderator.id}> [**${ctx.utils.escapeDiscordsFuckingEditing(`${moderator.username}#${moderator.discriminator}`)}**]\n**Reason:**\n> ${reason.replace(/\n/g, '\n> ')}`,
            color: ctx.utils.colors('purple'),
            thumbnail: {url: member.avatarURL()}
        }
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

memberBanned = async function(moderator, member, reason, time, ctx, meta, mObj) {
    try {
        const g = await check(ctx, moderator.guild.id, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook);
        let timeToAAAAAAA = ``;
        if(time) {
            timeToAAAAAAA = ` (${await ctx.utils.timeConvert(time)})`
        }
        let embed = {
            title: `Member Banned`,
            description: `**Member:** <@${member.id}> [**${ctx.utils.escapeDiscordsFuckingEditing(`${member.username}#${member.discriminator}`)}**]${timeToAAAAAAA}\n**Moderator:** <@${moderator.id}> [**${ctx.utils.escapeDiscordsFuckingEditing(`${moderator.username}#${moderator.discriminator}`)}**]\n**Reason:**\n> ${reason.replace(/\n/g, '\n> ')}`,
            color: ctx.utils.colors('purple'),
            thumbnail: {url: member.avatarURL()}
        }
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

memberUnbanned = async function(moderator, member, reason, time, ctx, meta, mObj) {
    try {
        const g = await check(ctx, moderator.guild.id, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook);
        let prefix = ``;
        if(time) {
            prefix = ` Time`;
        }
        let embed = {
            title: `Member${prefix} Unbanned`,
            description: `**Member:** <@${member.id}> [**${ctx.utils.escapeDiscordsFuckingEditing(`${member.username}#${member.discriminator}`)}**]\n**Moderator:** <@${moderator.id}> [**${ctx.utils.escapeDiscordsFuckingEditing(`${moderator.username}#${moderator.discriminator}`)}**]\n**Reason:**\n> ${reason.replace(/\n/g, '\n> ')}`,
            color: ctx.utils.colors('purple'),
            thumbnail: {url: member.avatarURL()}
        }
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

memberMuted = async function(moderator, member, reason, time, ctx, meta, mObj) {
    try {
        const g = await check(ctx, moderator.guild.id, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook);
        let timeToAAAAAAA = ``;
        if(time) {
            timeToAAAAAAA = ` (${await ctx.utils.timeConvert(time)})`
        }
        let embed = {
            title: `Member Muted`,
            description: `**Member:** <@${member.id}> [**${ctx.utils.escapeDiscordsFuckingEditing(`${member.username}#${member.discriminator}`)}**]${timeToAAAAAAA}\n**Moderator:** <@${moderator.id}> [**${ctx.utils.escapeDiscordsFuckingEditing(`${moderator.username}#${moderator.discriminator}`)}**]\n**Reason:**\n> ${reason.replace(/\n/g, '\n> ')}`,
            color: ctx.utils.colors('purple'),
            thumbnail: {url: member.avatarURL()}
        }
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

memberUnmuted = async function(moderator, member, reason, time, ctx, meta, mObj) {
    try {
        const g = await check(ctx, moderator.guild.id, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook);
        let prefix = ``;
        if(time) {
            prefix = ` Time`;
        }
        let embed = {
            title: `Member${prefix} Unmuted`,
            description: `**Member:** <@${member.id}> [**${ctx.utils.escapeDiscordsFuckingEditing(`${member.username}#${member.discriminator}`)}**]\n**Moderator:** <@${moderator.id}> [**${ctx.utils.escapeDiscordsFuckingEditing(`${moderator.username}#${moderator.discriminator}`)}**]\n**Reason:**\n> ${reason.replace(/\n/g, '\n> ')}`,
            color: ctx.utils.colors('purple'),
            thumbnail: {url: member.avatarURL()}
        }
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

module.exports = [
    {
        event: "userWarn",
        name: "Member Warning",
        func: userWarn
    },
    {
        event: "clearWarnings",
        name: "Member Warnings Cleared",
        func: clearWarnings
    },
    {
        event: "deleteWarning",
        name: "Member Warning Removed",
        func: deleteWarning
    },
    {
        event: "memberKicked",
        name: "Member Kicked",
        func: memberKicked
    },
    {
        event: "memberBanned",
        name: "Member Banned",
        func: memberBanned
    },
    {
        event: "memberUnbanned",
        name: "Member Unbanned",
        func: memberUnbanned
    },
    {
        event: "memberMuted",
        name: "Member Muted",
        func: memberMuted
    },
    {
        event: "memberUnmuted",
        name: "Member Unmuted",
        func: memberUnmuted
    },
];
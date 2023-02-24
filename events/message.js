// everything includes event stuff, ctx, and meta.
async function check(ctx, guild, meta) { const g = await ctx.utils.lookupGuild(ctx, guild); if(g && g.logging === true && g.loggingchannelID !== null && g[`logging${meta}`] !== false && g.loggingchannelWebhook !== `{}`) {return g} else {return false} }
messageDelete = async function(message, ctx, meta, mObj) {
    try {
        if((message.content || message.attachments.length > 0) && message.author && message.author.username && message.author.id) {
            if(!ctx.cache.snipedMsgs[`${message.channel.id}`] || typeof ctx.cache.snipedMsgs[`${message.channel.id}`] !== `object`) {
                ctx.cache.snipedMsgs[`${message.channel.id}`] = {}
            };

            const stamp = Date.now()

            let author = {
                username: message.author.username || `🤷`,
                discriminator: message.author.discriminator || `0000`,
                avatarURL: message.author.avatarURL || ctx.bot.user.avatarURL,
            }

            if(message.author && message.author.id && ctx.bot.users.find(u => u.id == message.author.id)) {
                author = ctx.bot.users.find(u => u.id == message.author.id);
            }

            ctx.cache.snipedMsgs[`${message.channel.id}`][stamp] = {
                content: message.content || null,
                attachments: message.attachments.map(a => [{
                    filename: a.filename, 
                    link: `https://cache.nyx.bot/${a.url.split(`/`).slice(5)[0]}/${a.url.split(`/`).slice(6)[0]}`
                }][0]),
                deleted: stamp,
                author
            }

            setTimeout(() => {
                if(ctx.cache.snipedMsgs[`${message.channel.id}`][stamp]) {
                    delete ctx.cache.snipedMsgs[`${message.channel.id}`][stamp]
                }
            }, 600000)
        }
        //if(message.content && message.author.username) {
        //    if(ctx.cache.snipedMsgs[`${message.channel.id}`] && typeof ctx.cache.snipedMsgs[`${message.channel.id}`].delete == `function`) {
        //        ctx.cache.snipedMsgs[`${message.channel.id}`].delete()
        //    };
        //
        //    ctx.cache.snipedMsgs[`${message.channel.id}`] = {
        //        autoDel: setTimeout(() => {
        //            if(ctx.cache.snipedMsgs[`${message.channel.id}`]) ctx.cache.snipedMsgs[`${message.channel.id}`].delete()
        //        }, 600000),
        //        content: message.content || null,
        //        deleted: Date.now(),
        //        author: {
        //            username: message.author.username || `🤷`,
        //            discriminator: message.author.discriminator || `0000`,
        //            avatarURL: message.author.avatarURL || ctx.bot.user.avatarURL,
        //        },
        //        delete: () => {
        //            delete ctx.cache.snipedMsgs[`${message.channel.id}`];
        //        }
        //    }
        //}
        const g = await check(ctx, message.channel.guild.id, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook);
        let author = ''; if(message.author) {author = ` by <@${message.author.id}>`}
        let msg = ''; if(message.content) {msg = `\n${message.content}`}
        let embd = {
            title: `Deleted Message`,
            description: `Deleted **Message** in <#${message.channel.id}>${author}${msg.substring(0, 1800)}`,
            footer: {text: `MESSAGE ID: ${message.id}`},
            color: ctx.utils.colors('red')
        };
        if(message && message.attachments && message.attachments[0]) {
            embd.description += `\n\n**${message.attachments.length} attachment${message.attachments.length == 1 ? `` : `s`}**\n> ${message.attachments.map(a => `${ctx.file} [${a.filename}](https://cache.nyx.bot/${a.url.split(`/`).slice(5)[0]}/${a.url.split(`/`).slice(6)[0]}`).join(`\n> `)})`
        }
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

messageUpdate = async function(message, oldMessage, ctx, meta, mObj) {
    try {
        if(!message.author || message.author.bot) return;
        if(oldMessage.content == message.content) return;
        const g = await check(ctx, message.channel.guild.id, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook);
        let author = ''; if(message.author) {author = ` by <@${message.author.id}>`}
        let msg = ''; if(message.content) {msg = `\n${message.content}`}; let link = ``
        if(message && message.id && message.channel && message.channel.guild && message.channel.id && message.channel.guild.id) {link = `https://discord.com/channels/${message.channel.guild.id}/${message.channel.id}/${message.id}`}
        let embd = {
            title: `Edited Message`,
            description: `Edited [**Message**](${link}) in <#${message.channel.id}>${author}`,
            fields: [],
            footer: {text: `AUTHOR ID: ${message.author.id}  //  MESSAGE ID: ${message.id}`},
            color: ctx.utils.colors('gold')
        };
        if(oldMessage && oldMessage.content) {
            embd.fields.push({
                value: oldMessage.content,
                name: `Old Message`,
                inline: false,
            })
        }
        if(message && message.content) {
            embd.fields.push({
                value: message.content,
                name: `New Message`,
                inline: false,
            })
        }
        if(message && message.attachments && message.attachments[0]) {
            embd.description += `\n\n**${message.attachments.length} attachment${message.attachments.length == 1 ? `` : `s`}**\n> ${message.attachments.map(a => `${ctx.file} [${a.filename}](https://cache.nyx.bot/${a.url.split(`/`).slice(5)[0]}/${a.url.split(`/`).slice(6)[0]}`).join(`\n> `)})`
        }
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

messageDeleteBulk = async function(messages, ctx, meta, mObj) {
    try {
        const guildrawthing = await messages.find(m => m.guild !== undefined).guild
        if(!guildrawthing) return;
        const g = await check(ctx, guildrawthing.id, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook)
        let embd = {
            title: `Bulk Message Delete`,
            description: `Bulk Deleted **Messages** in <#${messages[0].channel.id}> **(${messages.length})**`,
            color: ctx.utils.colors('red')
        };
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

messageReactionRemoveAll = async function(message, ctx, meta, mObj) {
    try {
        const g = await check(ctx, message.channel.guild.id, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook)
        let link = ``
        if(message && message.id && message.channel && message.channel.guild && message.channel.id && message.channel.guild.id) {link = `https://discord.com/channels/${message.channel.guild.id}/${message.channel.id}/${message.id}`}
        let embd = {
            title: `Reactions Deleted`,
            description: `Removed **Reactions** from [**Message**](${link}) in <#${message.channel.id}>`,
            color: ctx.utils.colors('red')
        };
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {}
}

module.exports = [
    {
        event: "messageDelete",
        name: "Message Deletion",
        func: messageDelete
    },
    {
        event: "messageUpdate",
        name: "Message Update",
        func: messageUpdate
    },
    {
        event: "messageDeleteBulk",
        name: "Bulk Message Deletion",
        func: messageDeleteBulk
    },
    {
        event: "messageReactionRemoveAll",
        name: "Total Reactions Deletion",
        func: messageReactionRemoveAll
    },
];
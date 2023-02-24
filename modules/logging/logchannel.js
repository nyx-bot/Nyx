const icons = require('../../res/webhookIcons.json');

module.exports = {
    "name": "logchannel",
    "desc": "Set the server logs channel!\n[Requires create webhook permission]",
    "usage": ";logchannel <#channel>",
    "args": [
        {
            "opt": false,
            "arg": "#channel"
        }
    ],
    "permission": 2,
    "example": "`;logs channel #modlogs`\n\nSet the logs channel to a channel named #modlogs",
    "aliases": [
        "loggingchannel"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 7,
                "name": "channel",
                "description": "The channel to post logs in",
                "required": true
            }
        ]
    },
    func: async function logchannel(ctx, msg, args) {
        let chnlID = args[0].match(/\d+/);
        let channel = await msg.channel.guild.channels.find(channel => channel.id == chnlID)
        if(channel) {
            if(channel.type === 0) {
                const g = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
                if(g.loggingchannelID == channel.id) return msg.reply(`${ctx.fail} The logging channel was already set to <#${g.loggingchannelID}>!`);
                const m = await msg.reply(`${ctx.processing} Setting log channel to <#${channel.id}>`)
                if(g.dataValues.loggingchannelWebhook == '{}') {
                    channel.createWebhook({
                        name: `Nyx Logs`,
                        avatar: icons[`main`],
                    }).then(async webhook => {
                        await g.update({loggingchannelWebhook: JSON.stringify({id: webhook.id, token: webhook.token}), loggingchannelID: channel.id}, {
                            where: {
                                id: msg.channel.guild.id
                            }
                        });
                        g.save().then(res => res.toJSON()).then(res => {
                            return m.edit(`${ctx.pass} Successfully set the logging channel to <#${channel.id}>!`)
                        })
                    }).catch(e => {
                        return m.edit(`${ctx.fail} I couldn't create a webhook for that channel! Do I have permission?`)
                    })
                } else {
                    const webhook = JSON.parse(g.dataValues.loggingchannelWebhook);
                    await ctx.libs.superagent
                        .delete(`https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`)
                        .then(a => {
                            channel.createWebhook({
                                name: `Nyx Logs`,
                                avatar: icons[`main`],
                            }).then(async wbhk => {
                                await g.update({loggingchannelWebhook: JSON.stringify({id: wbhk.id, token: wbhk.token}), loggingchannelID: channel.id}, {
                                    where: {
                                        id: msg.channel.guild.id
                                    }
                                });
                                g.save().then(res => res.toJSON()).then(res => {
                                    return m.edit(`${ctx.pass} Successfully set the logging channel to <#${channel.id}>!`)
                                })
                            }).catch(e => {
                                return m.edit(`${ctx.fail} I couldn't create a webhook for that channel! Do I have permission?`)
                            })
                        }).catch(() => {
                            channel.createWebhook({
                                name: `Nyx Logs`,
                                avatar: icons[`main`],
                            }).then(async wbhk => {
                                await g.update({loggingchannelWebhook: JSON.stringify({id: wbhk.id, token: wbhk.token}), loggingchannelID: channel.id}, {
                                    where: {
                                        id: msg.channel.guild.id
                                    }
                                });
                                g.save().then(res => res.toJSON()).then(res => {
                                    return m.edit(`${ctx.pass} Successfully set the logging channel to <#${channel.id}>!`)
                                })
                            }).catch(e => {
                                return m.edit(`${ctx.fail} I couldn't create a webhook for that channel! Do I have permission?`)
                            })
                        });
                }
            } else return msg.reply(`${ctx.fail} This channel isn't a **text** channel!`)
        } else return msg.reply(`${ctx.fail} I can't find that channel!`)
    }
}
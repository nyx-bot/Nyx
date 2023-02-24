function icon(ctx, thing) {if(!thing || thing == 'false') {return {icon: ctx.emoji.status.unavailable, text: `Disabled`}} else {return {icon: ctx.emoji.status.available, text: "Enabled"}}}

const icons = require('../../res/webhookIcons.json');

module.exports = {
    "name": "logs",
    "desc": "Show the current logging settings, or change logging settings!",
    "args": [
        {
            "opt": true,
            "arg": "enable / disable",
            "args": [
                {
                    "opt": false,
                    "arg": "name of module / \"all\""
                }
            ]
        }
    ],
    "permission": 2,
    "example": [
        "`;logs disable moderation`\n\nDisable the modlogs for moderation",
        "`;logs disable emojis`\n\nDisable the modlogs for emoji modifiations",
        "`;logs enable message`\n\nEnable logging for message modifications",
        "`;logs enable members`\n\nEnable logging for member updates"
    ],
    "aliases": [
        "logging",
        "log"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 1,
                "name": "enable",
                "description": "Enable a specific module!",
                "required": false,
                "options": [
                    {
                        "type": 3,
                        "name": "module",
                        "required": true,
                        "description": "The module to enable for logging!"
                    }
                ]
            },
            {
                "type": 1,
                "name": "disable",
                "description": "Disable a specific module!",
                "required": false,
                "options": [
                    {
                        "type": 3,
                        "name": "module",
                        "required": true,
                        "description": "The module to disable for logging!"
                    }
                ]
            }
        ]
    },
    func: async function (ctx, msg, args) {
        const g = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
        if(!args[0]) {
            let types = new Map()
            Array.from(ctx.events).forEach(event => {
                if(!types.get(event[1].type)) {types.set(event[1].type, event[1])}
            });
            let fields = [];
            Array.from(types).forEach(type => {
                if(g[`logging${type[1].type}`] !== undefined) {
                    fields.push(
                        `${icon(ctx, g[`logging${type[1].type}`]).icon} \`${type[1].type}\``
                    )
                }
            });
            let channel = `--`; 
            let webhook;
            if(g.loggingchannelWebhook) {
                webhook = JSON.parse(g.loggingchannelWebhook);
                await ctx.libs.superagent.get(`https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`)
                .then(r => r.body).then(r => {
                    channel = `<#${r.channel_id}>`;
                    webhook = r;
                }).catch(e => {
                    if(e.status === 429 || e.status === 400) {} else {
                        g.update({loggingchannelWebhook: JSON.stringify({})}, {
                            where: {
                                id: msg.channel.guild.id
                            }
                        });
                        g.save()
                    }
                })
            }
            return msg.reply({content: `Log settings for **${ctx.utils.escapeDiscordsFuckingEditing(msg.channel.guild.name)}**`, embeds: [{
                title: `Logging`,
                description: `**Log Channel:** ${channel}\n\n${fields.join('\n')}`,
                footer: {text: `${msg.prefix}help logging`},
                color: ctx.utils.colors(`random`),
            }]})
        } else if(args[0].toLowerCase() == `enable`) {args.shift(); let logfunction = `logging${args[0].toLowerCase()}`;
            if(!(g[logfunction] === undefined)) {
                if(g[logfunction] === true) return msg.reply(`${ctx.fail} Logging for \`${args[0].toLowerCase()}\` is already enabled!`)
                if(!g.loggingchannelID) return msg.reply(`${ctx.fail} A logging channel hasn't been set yet!`);
                let names = [];
                Object.entries(g.dataValues).forEach(entry => {if(entry[0].startsWith(`logging`) && entry[0] !== (`loggingchannelID`) && entry[0] !== (`loggingchannelWebhook`) && entry[0] !== 'logging') names.push(entry[0])});
                let chnl = await ctx.bot.getChannel(`${g.loggingchannelID}`);
                let name = args[0].toLowerCase().charAt(0).toUpperCase() + args[0].toLowerCase().slice(1);
                if(name[name.length-1] == 's') {
                    name = name.substring(0, name.length-1)
                }
                if(g.dataValues.loggingchannelWebhook == '{}') {
                    chnl.createWebhook({
                        name: `Nyx Logs`,
                        avatar: icons[`main`],
                    }).then(async webhook => {
                        await g.update({loggingchannelWebhook: JSON.stringify({id: webhook.id, token: webhook.token}), [logfunction]: true}, {
                            where: {
                                id: msg.channel.guild.id
                            }
                        });
                        g.save().then(res => res.toJSON()).then(res => {
                            return msg.reply(`${ctx.pass} Successfully enabled \`${args[0].toLowerCase()}\` logging!`)
                        })
                    }).catch(e => {
                        return msg.reply(`${ctx.fail} I couldn't create a webhook for the current logging channel, <#${g.loggingchannelID}>! Do I have permission?`)
                    })
                } else {
                    await g.update({[logfunction]: true}, {
                        where: {
                            id: msg.channel.guild.id
                        }
                    });
                    g.save().then(res => res.toJSON()).then(res => {
                        return msg.reply(`${ctx.pass} Successfully enabled \`${args[0].toLowerCase()}\` logging!`)
                    })
                }
            } else if(args[0].toLowerCase() == `all`) {
                let names = [];
                Object.entries(g.dataValues).forEach(entry => {if(entry[0].startsWith(`logging`) && entry[0] !== (`loggingchannelID`) && entry[0] !== (`loggingchannelWebhook`) && entry[0] !== 'logging') names.push(entry[0])});
                let obj = {};
                let oldObj = {};
                let changed = 0;
                names.forEach(a => {
                    oldObj[a] = g.dataValues[a]
                    if(g.dataValues[a] === false) {changed++}
                    obj[a] = true
                });
                if(changed === 0) {return msg.reply(`${ctx.fail} Every logging module was already enabled!`)} else {
                    await g.update(obj, {
                        where: {
                            id: msg.channel.guild.id
                        }
                    });
                    g.save().then(res => res.toJSON()).then(res => {
                        return msg.reply(`${ctx.pass} Successfully updated ${changed} modules!`)
                    })
                }
            } else return msg.reply(`${ctx.fail} Invalid setting!`)
        } else if(args[0].toLowerCase() == `disable`) {args.shift(); let logfunction = `logging${args[0].toLowerCase()}`;
            if(!(g[logfunction] === undefined)) {
                if(g[logfunction] === false) return msg.reply(`${ctx.fail} Logging for \`${args[0].toLowerCase()}\` is already disabled!`);
                await g.update({[logfunction]: false}, {
                    where: {
                        id: msg.channel.guild.id
                    }
                });
                g.save().then(res => res.toJSON()).then(res => {
                    return msg.reply(`${ctx.pass} Successfully disabled \`${args[0].toLowerCase()}\` logging!`)
                })
            } else if(args[0].toLowerCase() == `all`) {
                let names = [];
                Object.entries(g.dataValues).forEach(entry => {if(entry[0].startsWith(`logging`) && entry[0] !== (`loggingchannelID`) && entry[0] !== (`loggingchannelWebhook`) && entry[0] !== 'logging') names.push(entry[0])});
                let obj = {};
                let oldObj = {};
                let changed = 0;
                names.forEach(a => {
                    oldObj[a] = g.dataValues[a]
                    if(g.dataValues[a] === true) {changed++}
                    obj[a] = false
                });
                if(changed === 0) {return msg.reply(`${ctx.fail} Every logging module was already disabled!`)} else {
                    await g.update(obj, {
                        where: {
                            id: msg.channel.guild.id
                        }
                    });
                    g.save().then(res => res.toJSON()).then(res => {
                        return msg.reply(`${ctx.pass} Successfully updated ${changed} modules!`)
                    })
                }
            } else return msg.reply(`${ctx.fail} Invalid setting!`)
        }
    }
}
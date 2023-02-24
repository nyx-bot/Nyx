module.exports = {
    "name": "help",
    "desc": "See help for Nyx, or see how to use specific commands!",
    "args": [
        {
            "opt": true,
            "arg": "module or command to get help for"
        }
    ],
    "aliases": [
        "h"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "query",
                "description": "The module or name of the command to retrieve help for.",
                "required": false
            }
        ]
    },
    func: async function (ctx, msg, args) {
        const moduleFind = async function() {
            let moduleInfo = ctx.groups[args[0].toLowerCase()] || ctx.cmdsObject[args[0].toLowerCase()];
            if(!moduleInfo || moduleInfo.length === 0) {return msg.reply({content: `${ctx.fail} I can't find that module!`})} else {
                let stat = `${ctx.emoji.status.unavailable}Disabled \`[${msg.prefix}module enable ${args[0].toLowerCase()}]\``; if(msg.channel.guild.guildSetting[args[0].toLowerCase()]) {stat = `${ctx.emoji.status.available}Enabled \`[${msg.prefix}module disable ${args[0].toLowerCase()}]\``}; if(typeof msg.channel.guild.guildSetting[args[0].toLowerCase()] != `boolean` && typeof msg.channel.guild.guildSetting[args[0].toLowerCase()] != `number`) {stat = `${ctx.emoji.status.unknown}Unchangeable`}
                let fields = [];
                if(typeof moduleInfo.commands == `object`) {
                    function a() {return new Promise((res, rej) => {
                        const orig = Object.entries(ctx.cmdsObject[args[0].toLowerCase()].commands);
                        let newA = []; orig.forEach(i => newA.push(i[0]));
                        return res(newA)
                    })}
                    moduleInfo = await a();
                };
                let allInteractions = true;
                moduleInfo.forEach(cmd => {
                    let cmdInfo = ctx.cmds.get(cmd);
                    let interaction = ctx.discordInteractionObject.find(o => o.name.toString().toLowerCase() == `${cmd}`.toLowerCase())
                    fields.push({
                        name: `${interaction ? ctx.slash : msg.channel.guild.guildSetting.prefix}${cmd}`,
                        value: cmdInfo.desc.replace(/\n/g, ' '),
                        inline: true,
                    }); if(!interaction) allInteractions = false;
                })
                let fuckingextend = ``; if(ctx.modules.get(args[0].toLowerCase()) && ctx.modules.get(args[0].toLowerCase()).extended) {fuckingextend = `\n\n${ctx.modules.get(args[0].toLowerCase()).extended}`}
                let description = `${fuckingextend}`
                if(ctx.modules.get(args[0].toLowerCase()) && ctx.modules.get(args[0].toLowerCase()).desc) {
                    description = `${ctx.modules.get(args[0].toLowerCase()).desc}${fuckingextend}`
                };
    
                let embed = {
                    title: `**${args[0].toLowerCase().charAt(0).toUpperCase() + args[0].slice(1)}** [${moduleInfo.length} commands]`,
                    description: `${stat + `\n\n` + description}`,
                    fields,
                    color: ctx.utils.colors('random'),
                };
    
                if(!allInteractions) embed.footer = {
                    text: `Not all commands listed here are compatible with Discord's slash commands system, so they are only usable by the classic command system.`
                };
    
                const dropdown = {
                    type: 3,
                    customID: `help`,
                    disabled: false,
                    options: [
                        ...ctx.modules.filter(m => m).map((m, i) => {
                            const moduleSetting = ctx.moduleSetting.get(ctx.groups.array[i].toLowerCase());
                            const emoji = moduleSetting && moduleSetting.emoji ? ctx.emoji[moduleSetting.emoji] || ctx.emoji.nyx[moduleSetting.emoji] ? ctx.emoji[moduleSetting.emoji] || ctx.emoji.nyx[moduleSetting.emoji] : moduleSetting.emoji : null
                            console.d(moduleSetting)
                            return {
                                label: ctx.groups.array[i][0].toUpperCase() + ctx.groups.array[i].slice(1),
                                value: ctx.groups.array[i].toLowerCase(),
                                description: m.desc,
                                emoji: emoji ? {
                                    id: emoji.match(/\d+/)[0].toString(),
                                    name: emoji.split(`:`).slice(1, 2)[0]
                                } : null,
                                default: ctx.groups.array[i].toLowerCase() == args[0].toLowerCase() ? true : false
                            }
                        })
                    ]
                };
    
                console.d(dropdown)
    
                return msg.reply({
                    embed,
                    flags: 64,
                    components: [
                        {
                            type: 1,
                            components: [ dropdown ]
                        }
                    ]
                })
            }
        }; const cmdFind = async function() {
            let cmd = ctx.cmds.get(ctx.aliases.get(args[0]) || args[0])
            if(!cmd || ctx.moduleSetting.get(cmd.group).canView === false) {
                return msg.reply(`${ctx.fail} That command doesn't exist!`)
            } else {let stat = `${ctx.emoji.status.unavailable}Disabled`; if(msg.channel.guild.guildSetting[cmd.group]) {stat = `${ctx.emoji.status.available}Enabled`}; if(typeof msg.channel.guild.guildSetting[cmd.group] != `boolean` && typeof msg.channel.guild.guildSetting[cmd.group] != `number`) {stat = `${ctx.emoji.status.unavailable}Unchangeable`}
                let interaction = ctx.discordInteractionObject.find(o => o.name.toString().toLowerCase() == `${cmd.name}`.toLowerCase());
                if(msg.data && interaction) {
                    let thing = `\n\n**Module:** \`${cmd.group.charAt(0).toUpperCase() + cmd.group.slice(1)}\` ${stat} \`[${msg.prefix}help ${cmd.group}]\``
                    const interactionTypes = [
                        s => `${s}`,
                        s => `${s}`,
                        s => `${s}`,
                        s => `${s}`,
                        s => `${s}`,
                        s => `@${s}`,
                        s => `#${s}`,
                        s => `@${s}`,
                        s => `@${s}`,
                        s => `${s}`,
                        s => `${s}`,
                    ], typeStrings = [
                        `Subcommand`,
                        `Subcommand`,
                        `String / Text`,
                        `Integer`,
                        `True / False`,
                        `Member`,
                        `Channel`,
                        `Role`,
                        `Member / Role`,
                        `Number`,
                        `File`,
                    ]
                    let usageCases = await new Promise(res => {
                        let obj = []
                        if(interaction.options && typeof interaction.options.length == `number`) {
                            let overallCase = `${ctx.slash}${interaction.name}`;
                            let overallDescriptions = [];
                            let addOverall = false;
                            for(i of interaction.options) {
                                if(i.options && typeof i.options.length == `number`) {
                                    let thisCase = `${ctx.slash}${interaction.name} ${i.name}`;
                                    let thisDescriptionSet = []
                                    for(o of i.options) {
                                        let addedString = interactionTypes[o.type-1](o.name)
                                        console.d(`option subcommand` + addedString)
                                        if(o.required) {
                                            thisCase = thisCase + ` \`{${addedString}}\``;
                                        } else thisCase = thisCase + ` \`[${addedString}]\``
                                        thisDescriptionSet.push(`**\`${o.name}\`** (${typeStrings[o.type-1]}): ${o.description}`)
                                    }; 
                                    obj.push({
                                        usage: thisCase,
                                        descriptions: thisDescriptionSet
                                    })
                                } else {
                                    addOverall = true;
                                    let addedString = interactionTypes[i.type-1](i.name)
                                    console.d(`regular option ` + addedString)
                                    if(i.required) {
                                        overallCase = overallCase + ` \`{${addedString}}\``;
                                    } else overallCase = overallCase + ` \`[${addedString}]\``;
                                    overallDescriptions.push(`**\`${i.name}\`** (${typeStrings[i.type-1]}): ${i.description}`)
                                };
                            }
                            if(addOverall) obj.unshift({
                                usage: overallCase,
                                descriptions: overallDescriptions
                            })
                        }; res(obj)
                    }); console.d(usageCases)
                    if(usageCases.length > 0) thing = thing + `\n**Usage:**` + `\n- ` + usageCases.map(o => `${o.usage}\n> ${o.descriptions.join(`\n> `)}`).join(`\n- `);
                    console.d(thing, usageCases)
                    const cmdDisabled = await ctx.utils.disabledCmds.status(ctx, msg.channel.guild.id, cmd.name);
                    let embd = {
                        title: `${interaction ? `${ctx.slash}` : ``}${cmd.name}`,
                        description: `${cmdDisabled ? `${ctx.emoji.status.unavailable}Manually Disabled\n\n` : ``}- ${cmd.desc}${thing}`,
                        color: ctx.utils.colors('random'),
                        flags: 64
                    }
                    return msg.reply({embeds: [embd]})
                } else {
                    let thing = `\n\n**Module:** \`${cmd.group.charAt(0).toUpperCase() + cmd.group.slice(1)}\` ${stat} \`[${msg.prefix}help ${cmd.group}]\``
                    if(cmd.usage) {
                        thing = thing + `\n**Usage:** \`${cmd.usage.replace(';', msg.prefix)}\``
                    }
                    if(cmd.aliases) {
                        thing = thing + `\n**Aliases:** \`${cmd.aliases.join('`, `')}\``
                    }
                    if(cmd.example) {
                        if(typeof cmd.example == 'object') {
                            thing = thing + `\n**Example:**\n> ${(cmd.example[Math.floor((Math.random() * cmd.example.length))]).replace(/;/g, msg.prefix).replace(/\n/g, '\n> ')}`
                        } else {
                            thing = thing + `\n**Example:**\n> ${(cmd.example).replace(/;/g, msg.prefix).replace(/\n/g, '\n> ')}`
                        }
                    }
                    const cmdDisabled = await ctx.utils.disabledCmds.status(ctx, msg.channel.guild.id, cmd.name);
                    let embd = {
                        title: `${interaction ? `${ctx.slash}` : ``}${cmd.name}`,
                        description: `${!interaction && cmdDisabled ? `${ctx.emoji.status.unavailable}Manually Disabled\n\n` : ``}- ${cmd.desc}${thing}`,
                        color: ctx.utils.colors('random'),
                        footer: {
                            text: `To view the updated parameters for Discord's slash commands, run /help instead!`
                        }
                    }
                    return msg.reply({embeds: [embd]})
                }
            }
        }
    
    
        if(!args[0]) {
            if(msg.addReaction) {
                await msg.addReaction(`📬`)
                try {
                    await msg.author.createDM().then(async channel => {
                        let embd = {
                            color: ctx.utils.colors('purple_medium'),
                            thumbnail: {url: 'https://s.nyx.bot/assets/images/untitled-274x154.png'},
                            fields: [
                                {
                                    name: `**Command Help**`,
                                    value: `For help on individual commands, use \`help <command>\` in a server.\nTo ensure you have essential permissions, use \`perms\` in a server.`
                                },
                                {
                                    name: `**Resources**`,
                                    value: `**- :notepad_spiral: [Command List](https://nyx.bot/commands)\n- :floppy_disk: [Uptime](https://status.nyx.bot)\n- :grey_question: [Support / Suggestions](https://nyx.bot/server)\n- :globe_with_meridians: [Website](https://nyx.bot/)\n- <:twitter:712402650435420285> [Twitter](https://twitter.com/nyxdisc)\n- :shield: [Privacy Policy](https://nyx.bot/privacy)\n- <:patreon:750461829985337435> [nyxSupporter <:nyxSupporter:702273579362025582>](https://www.patreon.com/NyxBot)**`,
                                    inline: true
                                }
                            ]
                        }
                        return await channel.createMessage({
                            content: `My prefix in **${msg.channel.guild.name}** is set as **\`${msg.prefix}\`**\n**You can change this using ${msg.prefix}prefix <prefix>**\n\n**Note:** Nyx v2 has migrated to slash commands! In the near future, the legacy command system will be removed, and slash commands will become the primary method of interaction!\n\nIf you are unable to use my slash commands, just re-invite me from my website! (<https://nyx.bot/i>) This will not affect any configurations of the server, it only adds the newest permission scope \`applications.commands\` which will allow me to provide the commands for this server!`,
                            embeds: [embd]
                        })
                    })
                } catch(e) {
                    return msg.reply(`${ctx.fail} I wasn't able to DM you!`)
                }
            } else {
                let embd = {
                    color: ctx.utils.colors('purple_medium'),
                    thumbnail: {url: 'https://s.nyx.bot/assets/images/untitled-274x154.png'},
                    fields: [
                        {
                            name: `**Command Help**`,
                            value: `For help on individual commands, use \`help <command>\` in a server.\nTo ensure you have essential permissions, use \`perms\` in a server.`
                        },
                        {
                            name: `**Resources**`,
                            value: `**- :notepad_spiral: [Command List](https://nyx.bot/commands)\n- :floppy_disk: [Uptime](https://status.nyx.bot)\n- :grey_question: [Support / Suggestions](https://nyx.bot/server)\n- :globe_with_meridians: [Website](https://nyx.bot/)\n- <:twitter:712402650435420285> [Twitter](https://twitter.com/nyxdisc)\n- :shield: [Privacy Policy](https://nyx.bot/privacy)\n- <:patreon:750461829985337435> [nyxSupporter <:NyxLove:942164350964228167>](https://www.patreon.com/NyxBot)**`,
                            inline: true
                        }
                    ]
                }
                return await msg.reply({
                    content: `My prefix in **${msg.channel.guild.name}** is set as **\`${msg.prefix}\`**\n**You can change this using ${msg.prefix}prefix <prefix>**`,
                    embeds: [embd],
                    flags: 64
                })
            }
        } else {
            if(args[1] && (args[0].toLowerCase() == `command` || args[0].toLowerCase() == `module`)) {
                const toFind = args.shift().toLowerCase();
                if(toFind == `command`) {
                    cmdFind()
                } else moduleFind();
            } else if(ctx.cmdsObject[args[0].toLowerCase()]) {
                if((ctx.groups[args[0].toLowerCase()] || ctx.cmdsObject[args[0].toLowerCase()]) && ctx.moduleSetting.get(args[0].toLowerCase()) && ctx.moduleSetting.get(args[0].toLowerCase()).canView === false) {return cmdFind()} else {moduleFind()}
            } else {
                cmdFind()
            }
        }
    }
}
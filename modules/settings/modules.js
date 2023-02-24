function icon(ctx, thing) {if(!thing) {return {icon: ctx.emoji.status.unavailable, text: `Disabled`}} else {return {icon: ctx.emoji.status.available, text: "Enabled"}}}
function switchName(string) {if(string == `logs` || string == `modlogs`) {return `logging`}; return(string)}

module.exports = {
    "name": "modules",
    "desc": "Check module settings, or toggle them!",
    "args": [
        {
            "opt": true,
            "arg": "toggle",
            "args": [
                {
                    "opt": false,
                    "arg": "module"
                }
            ]
        }
    ],
    "permission": 2,
    "aliases": [
        "module"
    ],
    "allowInDm": false,
    "interactionObject": {
        "options": [
            {
                "type": 1,
                "name": "toggle",
                "description": "Toggle a module",
                "options": [
                    {
                        "type": 3,
                        "name": "module",
                        "description": "The module in question to toggle. THIS IS NOT EFFECTIVE TO SLASH COMMANDS"
                    }
                ]
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let guildSetting = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
        if(!args[0]) {
            let fields = [];
            ctx.groups.array.forEach(module => {
                if(!(guildSetting[module] === undefined)) { let extended = ``
                    if(ctx.modules.get(module).extended) {extended = ` **[...]**`}
                    fields.push({
                        name: `${icon(ctx, guildSetting[module]).icon} ${module.charAt(0).toUpperCase() + module.slice(1)}`,
                        value: `${ctx.modules.get(module).desc}${extended}`,
                        inline: true,
                    })
                }
            })
            let embed = {
                title: `Module Settings`,
                description: `When you see **[...]** on a module, it has an extended description.\nUse ${msg.prefix}help {module} to see each command for that module (and a module's extended description)`,
                fields,
                color: ctx.utils.colors('random')
            }
            return msg.reply({embed})
        } else if(args[1] && (args[0].toLowerCase() == 'toggle' || args[0].toLowerCase() == 'switch')) {args.shift(); let module = switchName(args[0].toLowerCase());
            if(ctx.groups[module]) {let boolean = false; if(!guildSetting[module]) {boolean = true}
                await guildSetting.update({[module]: boolean}, {
                    where: {
                        id: msg.channel.guild.id
                    }
                });
                guildSetting.save().then(res => res.toJSON()).then(res => {
                    let txt = `enabled`; let boolean = res[module]; if(!boolean) {txt = `disabled`}
                    return msg.reply(`${ctx.pass} Successfully ${txt} **${module.charAt(0).toUpperCase() + module.slice(1)}!**`)
                })
            } else {
                return msg.reply(`${ctx.fail} Invalid module!`)
            }
        } else if(args[1] && (args[0].toLowerCase() == 'enable')) {args.shift(); let module = switchName(args[0].toLowerCase()); if(!ctx.groups[module]) return msg.reply(`${ctx.fail} Invalid module!`)
            if(guildSetting[module]) {return msg.reply(`${ctx.fail} **${module.charAt(0).toUpperCase() + module.slice(1)}** was already enabled!`)} else {
                await guildSetting.update({[module]: true}, {
                    where: {
                        id: msg.channel.guild.id
                    }
                });
                guildSetting.save().then(res => res.toJSON()).then(res => {
                    let txt = `enabled`; let boolean = res[module]; if(!boolean) {txt = `disabled`}
                    return msg.reply(`${ctx.pass} Successfully ${txt} **${module.charAt(0).toUpperCase() + module.slice(1)}!**`)
                })
            }
        } else if(args[1] && (args[0].toLowerCase() == 'disable')) {args.shift(); let module = switchName(args[0].toLowerCase()); if(!ctx.groups[module]) return msg.reply(`${ctx.fail} Invalid module!`)
            if(!guildSetting[module]) {return msg.reply(`${ctx.fail} **${module.charAt(0).toUpperCase() + module.slice(1)}** was already disabled!`)} else {
                await guildSetting.update({[module]: false}, {
                    where: {
                        id: msg.channel.guild.id
                    }
                });
                guildSetting.save().then(res => res.toJSON()).then(res => {
                    let txt = `enabled`; let boolean = res[module]; if(!boolean) {txt = `disabled`}
                    return msg.reply(`${ctx.pass} Successfully ${txt} **${module.charAt(0).toUpperCase() + module.slice(1)}!**`)
                })
            }
    
        } else {
            return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
        }
    }
}
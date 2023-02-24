module.exports = {
    "name": "disablecmd",
    "desc": "Disable a specific command for your server!",
    "args": [
        {
            "opt": false,
            "arg": "command to be disabled"
        }
    ],
    "permission": 2,
    "aliases": [
        "cmddisable",
        "disable"
    ],
    "allowInDm": false,
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "command",
                "description": "The command to be disabled. THIS IS NOT EFFECTIVE TO SLASH COMMANDS",
                "required": true
            }
        ]
    },
    func: async (ctx, msg, args) => {
        if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``);
        const cmd = ctx.cmds.get(ctx.aliases.get(args[0].toLowerCase()) || args[0].toLowerCase());
        if(!cmd || cmd.moduleSetting.canView == false) return msg.reply(`${ctx.fail} That command doesn't exist!`);
        if(cmd.moduleSetting.canSet == false) return msg.reply(`${ctx.fail} You can't disable that command!`);
        const c = await ctx.utils.disabledCmds.disable(ctx, msg.channel.guild.id, cmd.name)
        if(c === true) return msg.reply(`${ctx.pass} Sucessfully disabled \`${cmd.name}\`!`)
        else return msg.reply(`${ctx.fail} \`${cmd.name}\` was already disabled!`)
    }
}
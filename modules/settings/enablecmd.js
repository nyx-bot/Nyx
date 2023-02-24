module.exports = {
    "name": "enablecmd",
    "desc": "Enable a specific command that has been disabled for your server!",
    "args": [
        {
            "opt": false,
            "arg": "command to be enabled"
        }
    ],
    "permission": 2,
    "aliases": [
        "cmdenable",
        "enable"
    ],
    "allowInDm": false,
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "command",
                "description": "The command to be enabled. THIS IS NOT EFFECTIVE TO SLASH COMMANDS",
                "required": true
            }
        ]
    },
    func: async (ctx, msg, args) => {
        if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``);
        const cmd = ctx.cmds.get(ctx.aliases.get(args[0].toLowerCase()) || args[0].toLowerCase());
        if(!cmd || cmd.moduleSetting.canView == false) return msg.reply(`${ctx.fail} That command doesn't exist!`);
        const c = await ctx.utils.disabledCmds.enable(ctx, msg.channel.guild.id, cmd.name)
        if(c === true) return msg.reply(`${ctx.pass} Sucessfully enabled \`${cmd.name}\`!`)
        else return msg.reply(`${ctx.fail} \`${cmd.name}\` was already enabled!${msg.channel.guild.guildSetting[cmd.group] === false ? `\n\n- **NOTE:** The module that this command is listed under, \`${cmd.group}\`, is disabled! To enable it, you must use \`${msg.prefix}module enable ${cmd.group}\`` : ``}`)
    }
}
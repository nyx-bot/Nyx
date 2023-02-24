module.exports = {
    "name": "settings",
    "desc": "View/change the settings for the server!",
    "args": [],
    "permission": 2,
    "aliases": [
        "setup",
        "setting"
    ],
    "allowInDm": false,
    "interactionObject": {},
    func: async function(ctx, msg, args) {
        let guildSetting = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
        if(true) {
            let enabled = 0; let total = 0;
            ctx.groups.array.forEach(module => { total = total + 1; if(guildSetting[module]) {enabled = enabled + 1} }); let modlogsvalue = `\`${msg.prefix}logs\``; logboolean = true;
            if(!msg.channel.guild.guildSetting || !msg.channel.guild.guildSetting.logging) {modlogsvalue = `~~\`${msg.prefix}logs\`~~`; logboolean = false;}
            let muteroletext = `Not Set`
            if(guildSetting.muteRole) {muteroletext = `Set`}
            const 
            modroles = await JSON.parse(guildSetting.modRoles),
            adminroles = await JSON.parse(guildSetting.adminRoles)
            lengthA = await Object.entries(modroles), 
            lengthB = await Object.entries(adminroles);
            disabledCommands = await ctx.seq.models.DisabledCmds.findAll({where: {serverID: msg.channel.guild.id}});
            enabledCommands = ctx.totalCmds - disabledCommands.length
            let icon; if(logboolean) {icon = `Enabled`} else {icon = `Disabled`}
            let fields = [
                {
                    name: `Prefix **[${msg.prefix}]**`,
                    value: `\`${msg.prefix}prefix <prefix>\``,
                    inline: true,
                },
                {
                    name: `Modules **[${enabled}/${total} enabled]**`,
                    value: `\`${msg.prefix}modules [toggle <module>]\``,
                    inline: true,
                },
                {
                    name: `Logging **[${icon}]**`,
                    value: modlogsvalue,
                    inline: true,
                },
                {
                    name: `Mod Roles **[${lengthA.length}]**`,
                    value: `\`${msg.prefix}modrole add/rm <role>\``,
                    inline: true,
                },
                {
                    name: `Admin Roles **[${lengthB.length}]**`,
                    value: `\`${msg.prefix}adminrole add/rm <role>\``,
                    inline: true,
                },
                {
                    name: `Mute Role **[${muteroletext}]**`,
                    value: `\`${msg.prefix}muterole <role/clear>\``,
                    inline: true,
                },
                {
                    name: `OwO mode **[${msg.channel.guild.guildSetting.owomode === true ? `Enabled` : `Disabled`}]**`,
                    value: `\`${msg.prefix}owomode\``,
                    inline: true,
                },
                {
                    name: `Disabled Commands **[${disabledCommands.length} command${disabledCommands.length !== 1 ? `s` : ``}]**`,
                    value: `\`${msg.prefix}disablecmd <command>\``,
                    inline: true,
                },
                {
                    name: `Enabled Commands **[${enabledCommands} command${enabledCommands !== 1 ? `s` : ``}]**`,
                    value: `\`${msg.prefix}enablecmd <command>\``,
                    inline: true,
                },
            ];
            let menuembedthing = {
                title: `Settings`,
                fields,
                color: ctx.utils.colors('random')
            };
            return msg.reply({embeds: [menuembedthing]});
        }
    }
}
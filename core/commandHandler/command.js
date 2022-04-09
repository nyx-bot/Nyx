module.exports = interaction => new Promise(async res => {
    if((ctx.ready || ctx.config.elevated.find(i => i == interaction.user.id)) && ctx.bot.guilds.cache.has(interaction.guildId)) {
        if(global.ctx.cmdModuleMap.has(interaction.commandName)) {
            const command = global.ctx.modules[global.ctx.cmdModuleMap.get(interaction.commandName.toLowerCase())].commands[interaction.commandName.toLowerCase()]
            res(command)
            if(!interaction.replied) try {
                command.func(interaction)
            } catch(e) {
                if(interaction.deferred || interaction.replied) {
                    interaction.editReply(ctx.errMsg(interaction, null, e))
                } else interaction.reply(ctx.errMsg(interaction, null, e)).catch(console.error)
            }
        } else {
            res(null);
            if(interaction.deferred) {
                interaction.editReply(ctx.errMsg(interaction, null, `No command for "${interaction.commandName}"`))
            } else interaction.reply(ctx.errMsg(interaction, null, `No command for "${interaction.commandName}"`)).catch(console.error)
        }
    } else res(null)
})

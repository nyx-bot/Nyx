module.exports = interaction => new Promise(async res => {
    if((ctx.ready || ctx.config.elevated.find(i => i == interaction.user.id)) && ctx.bot.guilds.cache.has(interaction.guildId)) {
        if(global.ctx.cmdModuleMap.has(interaction.message.interaction.commandName)) {
            const command = global.ctx.modules[global.ctx.cmdModuleMap.get(interaction.message.interaction.commandName.toLowerCase())].commands[interaction.message.interaction.commandName.toLowerCase()];
            res(command)
            try {
                command.buttonFunc(interaction)
            } catch(e) {
                interaction.update(ctx.errMsg(interaction, null, `Error caught in interaction "${interaction.id}" [${interaction.customId}]`))
            }
        } else res(null, interaction.update(ctx.errMsg(interaction, null, `No command for "${interaction.message.interaction.commandName}"`)))
    } else res(null)
})
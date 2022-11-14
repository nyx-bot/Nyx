module.exports = (interaction) => new Promise(async (res, rej) => {
    try {
        console.log(ctx.cmds)
        if(interaction.type == `APPLICATION_COMMAND`) {
            if(ctx.cmds[interaction.commandName]) ctx.cmds[interaction.commandName].func(interaction, interaction.options._hoistedOptions, ctx.cmds[interaction.commandName].languages[interaction.locale])
        }
    } catch(e) {
        rej(e)
    }
})
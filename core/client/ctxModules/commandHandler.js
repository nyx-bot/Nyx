module.exports = (interaction) => new Promise(async (res, rej) => {
    let generalLocale = require(`../../../lang/en-US/general.json`);

    try {
        generalLocale = require(`../../../lang/${interaction.locale}/general.json`)
    } catch(e) {
        console.warn(`General locale file does NOT exist for language ${interaction.locale}`)
    }
    
    try {
        console.debug(interaction)

        const args = interaction.options._hoistedOptions
        let locale = ctx.cmds[interaction.commandName].languages[interaction.locale];

        if(locale.missingValues) {
            interaction.originalReply = interaction.reply;
            interaction.reply = (...d) => {
                if(typeof d[0] == `string`) {
                    d[0] = `${ctx.emoji.nyx.translator} ${generalLocale.missingTranslation}\n\n` + d[0]
                } else if(d[0].content) {
                    d[0].content = `${ctx.emoji.nyx.translator} ${generalLocale.missingTranslation}\n\n` + d[0].content
                }

                interaction.originalReply(...d)
            }
        }

        if(interaction.type == `APPLICATION_COMMAND`) {
            if(ctx.cmds[interaction.commandName]) ctx.cmds[interaction.commandName].func(interaction, args, locale)
        }
    } catch(e) {
        rej(e)
    }
})
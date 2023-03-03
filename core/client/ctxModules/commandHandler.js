module.exports = (interaction) => new Promise(async (res, rej) => {
    let generalLocale = require(`../../../lang/en-US/general.json`);

    try {
        generalLocale = require(`../../../lang/${interaction.locale}/general.json`)
    } catch(e) {
        console.warn(`General locale file does NOT exist for language ${interaction.locale}`)
    }
    
    try {
        interaction = await ctx.utils.interactionParser(interaction);

        let locale = ctx.cmds[interaction.data.name].languages[interaction.locale];

        interaction.reply = (...raw) => ctx.replyHandler({ interaction, content: raw, locale });

        if(interaction.type == 2) {
            if(ctx.cmds[interaction.data.name]) ctx.cmds[interaction.data.name].func(interaction, interaction.args, locale)
        }
    } catch(e) {
        rej(e)
    }
})
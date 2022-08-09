const fs = require('fs')

module.exports = interaction => new Promise(async res => {
    if((ctx.ready || ctx.config.elevated.find(i => i == interaction.user.id)) && ctx.bot.guilds.cache.has(interaction.guildId)) {
        if(global.ctx.cmdModuleMap.has(interaction.message.interaction.commandName)) {
            const command = global.ctx.modules[global.ctx.cmdModuleMap.get(interaction.message.interaction.commandName.toLowerCase())].commands[interaction.message.interaction.commandName.toLowerCase()];
            res(command);

            const file = `${global.ctx.cmdModuleMap.get(interaction.message.interaction.commandName.toLowerCase()).toLowerCase()}/${interaction.message.interaction.commandName.toLowerCase()}`

            const preferredLanguage = `./lang/${interaction.locale}/${file}.json`;
            const defaultLanguage = `./lang/${require(`../../config.json`).defaultLanguage}/${file}.json`;

            if(fs.existsSync(preferredLanguage)) {
                console.log(`Locale ${interaction.locale} file exists for ${file}`);
                try {
                    interaction.langFile = require(`../.${preferredLanguage}`)
                } catch(e) {
                    console.log(`Unable to add preferred langFile for ${file}: ${e}`)
                }
            };
            
            if(!interaction.langFile && fs.existsSync(defaultLanguage)) {
                console.log(`Locale ${interaction.locale} file does NOT exist for ${file} -- however, default language (${require(`../../config.json`).defaultLanguage}) exists.`)
                try {
                    interaction.langFile = require(`../.${defaultLanguage}`)
                } catch(e) {
                    console.log(`Unable to add default langFile for ${file}: ${e}`)
                }
            };
            
            if(!interaction.langFile) console.log(`There was no usable locale file for ${file} (tried user's & default)`)

            try {
                command.buttonFunc(interaction)
            } catch(e) {
                interaction.update(ctx.errMsg(interaction, null, `Error caught in interaction "${interaction.id}" [${interaction.customId}]`))
            }
        } else res(null, interaction.update(ctx.errMsg(interaction, null, `No command for "${interaction.message.interaction.commandName}"`)))
    } else res(null)
})
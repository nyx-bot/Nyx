const fs = require('fs');

module.exports = interaction => new Promise(async res => {
    if((ctx.ready || ctx.config.elevated.find(i => i == interaction.user.id)) && ctx.bot.guilds.cache.has(interaction.guildId)) {
        if(global.ctx.cmdModuleMap.has(interaction.commandName)) {
            const command = global.ctx.modules[global.ctx.cmdModuleMap.get(interaction.commandName.toLowerCase())].commands[interaction.commandName.toLowerCase()]
            res(command);

            const file = `${global.ctx.cmdModuleMap.get(interaction.commandName.toLowerCase()).toLowerCase()}/${interaction.commandName.toLowerCase()}`;

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

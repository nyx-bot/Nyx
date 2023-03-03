const fs = require('fs'), readCommand = require(`../readCommand`)

const { Client } = require(`oceanic.js`);

const { SlashCommandBuilder } = require(`@discordjs/builders`)

module.exports = (config) => new Promise(async (res, rej) => {
    try {
        const modules = fs.readdirSync(`./core/client/cmdModules/`)
    
        const commands = [];
    
        console.debug(`Creating slash commands for ${modules.length} modules...`)
    
        for (m of modules) {
            try {
                const cmds = fs.readdirSync(`./core/client/cmdModules/${m}/`);
                console.debug(`Adding module ${m} with ${commands.length} cmd(s)`);
        
                for (let cmd of cmds) {
                    let cmdName = cmd.split(`.`).slice(0, -1).join(`.`);
                    
                    const command = readCommand(m, cmd, cmdName);
    
                    const slashCommand = new SlashCommandBuilder();
    
                    console.debug(`Parsing command ${cmdName}:`)
    
                    slashCommand.setName(command.languages[`en-US`].command.name);
                    console.debug(`| Set name as "${command.languages[`en-US`].command.name}"`);
    
                    let nameLocales = {}; 
                    Object.entries(command.languages).forEach(o => nameLocales[o[0]] = o[1].command.name);
                    slashCommand.setNameLocalizations(nameLocales);
                    console.debug(`| Applied ${Object.keys(nameLocales).length} localization(s) for name`)
    
                    slashCommand.setDescription(command.languages[`en-US`].command.description);
                    console.debug(`| Set description as "${command.languages[`en-US`].command.description}"`)
    
                    let descriptionLocales = {}; 
                    Object.entries(command.languages).forEach(o => descriptionLocales[o[0]] = o[1].command.description);
                    slashCommand.setDescriptionLocalizations(descriptionLocales);
                    console.debug(`| Applied ${Object.keys(descriptionLocales).length} localization(s) for description`);
    
                    if(command.languages[`en-US`].command.options) {
                        console.debug(`| ${command.languages[`en-US`].command.options.length} option(s) exist!`);
    
                        for(i in command.languages[`en-US`].command.options) {
                            const opt = command.languages[`en-US`].command.options[i];
    
                            const func = `addStringOption`;
                            if(opt.type && slashCommand[`add${opt.type[0].toUpperCase + opt.type.slice(1)}Option`]) {
                                func = `add${opt.type[0].toUpperCase + opt.type.slice(1)}Option`;
                            };
    
                            console.debug(`| Adding ${func.slice(3, -6)} option`)
    
                            slashCommand[func](interaction => {
                                interaction.setName(opt.name);
                                console.debug(`| - Set ${func.slice(3, -6)} option name as ${opt.name}`)
    
                                let slashNameLocales = {}; 
                                Object.entries(command.languages).forEach(o => slashNameLocales[o[0]] = o[1].command.options[i].name);
                                interaction.setNameLocalizations(slashNameLocales);
                                console.debug(`| - Applied ${Object.keys(slashNameLocales).length} localization(s) for name`)
    
                                interaction.setDescription(opt.description);
                                console.debug(`| - Set ${func.slice(3, -6)} option description as ${opt.description}`)
    
                                let slashDescriptionLocales = {}; 
                                Object.entries(command.languages).forEach(o => slashDescriptionLocales[o[0]] = o[1].command.options[i].description);
                                interaction.setDescriptionLocalizations(slashDescriptionLocales);
                                console.debug(`| - Applied ${Object.keys(slashDescriptionLocales).length} localization(s) for description`);
    
                                if(opt.required) {
                                    console.debug(`| - ${func.slice(3, -6)} option is required!`);
                                    interaction.setRequired(true);
                                }
    
                                return interaction;
                            })
                        }
                    };
    
                    commands.push(slashCommand.toJSON())
                }
            } catch(e) {
                errorHandler(e)
            }
        };

        const restClient = new Client({ auth: config.token, rest: true });

        console.log(`Registering ${commands.length} command${commands.length == 1 ? `` : `s`}!`)

        restClient.rest.applicationCommands.bulkEditGlobalCommands(config.botID, commands).then(data => {
            console.log(`Successfully updated data!`)
            console.debug(data[0])
            res({
                commands, data
            })
        }).catch(errorHandler)
    } catch(e) {
        errorHandler(e)
    }
})
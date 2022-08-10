const fs = require('fs');

const { token, botID, elevated } = require('../../config.json');

const { Routes } = require('discord-api-types/v10'), rest = new (require('@discordjs/rest').REST)({ version: '10', authPrefix: `Bot` }).setToken(token);

module.exports = () => new Promise(async res => {
    console.log(`Fetching existing commands library from Discord API...`);
    let existingCommands;
    try {
        existingCommands = await rest.get(Routes.applicationCommands(botID), {auth: true});
    } catch(e) {
        if(`${e}`.toLowerCase().includes(`unauthorized`)) {
            console.error(`The token provided is invalid! (Discord returned an error code of 401, meaning "unauthorized")`)
        } else console.error(e);

        process.exit(1)
    }
    console.log(`Discord reported ${existingCommands.length} commands!`)

    const modules = fs.readdirSync(`./core/commandHandler/cmdModules`);
    console.log(`Importing ${modules.length} modules...`);

    const commandPayload = [];
    // commandPayload will include individual slash commands for Discord's API.

    const moduleList = []

    for(const m of modules) {
        const moduleDir = fs.readdirSync(`./core/commandHandler/cmdModules/${m}/`);

        let moduleSettings = {};

        if(moduleDir.find(c => c == `settings.json`)) {
            try {
                moduleSettings = require(`./${m}/settings.json`)
            } catch(e) {}
        }

        const commands = moduleDir.filter(f => f.endsWith(`.js`));

        const cmds = []

        for(cmd of commands) {
            const c = require(`./cmdModules/${m}/${cmd}`);

            if(typeof c === `object` && typeof c.func == `function`) {
                let command = {
                    func: () => {},
                    options: {},
                    name: `${cmd}`.toLowerCase().replace(`.js`, ``),
                    description: `[${m[0].toUpperCase() + m.slice(1)}]`
                };
                
                const languages = {};

                for(locale of fs.readdirSync(`./lang`)) {
                    const location = `./lang/${locale}/${m}/${cmd.split(`.`).slice(0, -1).join(`.`)}.json`
                    let exists = fs.existsSync(location);
                    if(exists) {
                        //console.log(location + ` exists!`);
                        try {
                            languages[locale] = require(`../../` + location)
                        } catch(e) {
                            console.error(`unable to import ${location}:`, e);
                            await new Promise(r => setTimeout(r, 2000))
                        }
                    } else {
                        //console.log(location + ` does not exist`)
                    }
                };

                let completed = false;

                if(!c.interaction && languages[`en-US`]) {
                    c.interaction = new (require('@discordjs/builders').SlashCommandBuilder)();

                    console.log(`there are ${Object.keys(languages).length} translations available for command ${command.name} (${Object.keys(languages).join(`, `)})`);

                    const primary = languages[`en-US`].command;

                    c.interaction.setName(primary && primary.name ? primary.name : `${cmd}`.toLowerCase().replace(`.js`, ``));
                    console.log(`  ---------------------------  \n| Name for ${command.name}: ${c.interaction.name}`)
                    for(lang of Object.entries(languages)) {
                        if(lang[1] && lang[1].command && lang[1].command.name) {
                            c.interaction.setNameLocalization(lang[0], lang[1].command.name);
                            console.log(`| ${lang[0]}: ${lang[1].command.name}`)
                        }
                    };

                    if(primary && primary.description && `${primary.description}`.length >= 5) {
                        console.log(primary.description)
                        c.interaction.setDescription(`[${m[0].toUpperCase() + m.slice(1)}] // ${primary.description}`);
                        console.log(`| Description for ${command.name}: ${`[${m[0].toUpperCase() + m.slice(1)}] // ${c.interaction.description}`}`)
                        for(lang of Object.entries(languages)) {
                            if(lang[1] && lang[1].command && lang[1].command.description) {
                                c.interaction.setDescriptionLocalization(lang[0], lang[1].command.description);
                                console.log(`| ${lang[0]}: ${lang[1].command.description}`)
                            }
                        }
                    }

                    if(c.interactionOptions && primary.options.length == c.interactionOptions.length) {
                        for(i in c.interactionOptions) {
                            const functionName = `add${c.interactionOptions[i].type[0].toUpperCase() + c.interactionOptions[i].type.slice(1).toLowerCase()}Option`
                            if(typeof c.interaction[functionName] == `function`) {
                                c.interaction[functionName](o => {
                                    if(primary.options[i].name) o.setName(primary.options[i].name);
                                    if(primary.options[i].description) o.setDescription(primary.options[i].description);

                                    console.log(`| ${functionName} (${primary.options[i].name} / ${primary.options[i].description})`);

                                    for(lang of Object.entries(languages)) {
                                        if(lang[1].command.options[i].name) {
                                            o.setNameLocalization(lang[0], lang[1].command.options[i].name);
                                            console.log(`| > ${lang[0]} Name: ${lang[1].command.options[i].name}`)
                                        };

                                        if(lang[1].command.options[i].description) {
                                            o.setDescriptionLocalization(lang[0], lang[1].command.options[i].description);
                                            console.log(`| > ${lang[0]} Desc: ${lang[1].command.options[i].description}`)
                                        }
                                    };

                                    if(c.interactionOptions[i].required) o.setRequired(true);

                                    return o;
                                })
                            }
                        }
                    } else if(primary && primary.options && primary.options.length && primary.options.length != c.interactionOptions.length) {
                        console.error(`Command ${m[0].toUpperCase() + m.slice(1)}/${`${cmd}`.toLowerCase().replace(`.js`, ``)} has interaction options, but does not match with the amount of options defined in the en-US locale! (command: ${c.interactionOptions.length}, locale: ${primary.options.length})`);
                        await new Promise(r => setTimeout(r, 2000))
                    }

                    completed = true;
                } else if (c.interaction) {
                    if(c.interaction.description && `${c.interaction.description}`.length >= 5) c.interaction.setDescription(`[${m[0].toUpperCase() + m.slice(1)}] // ${c.interaction.description}`)
    
                    if(!c.interaction.name) c.interaction.setName(`${cmd}`.toLowerCase().replace(`.js`, ``))

                    completed = true;
                } else {
                    console.error(`Command ${m[0].toUpperCase() + m.slice(1)}/${`${cmd}`.toLowerCase().replace(`.js`, ``)} does not export an object, has no function, or has no interaction object! Will not be imported.`);
                    await new Promise(r => setTimeout(r, 2000))
                }

                if(completed) {
                    if(moduleSettings.hidden && moduleSettings.hidden === true) c.interaction.setDefaultPermission(false);

                    command = c.interaction.toJSON();
                    command.func = c.func;
                    command.localizations = languages
    
                    let payload = c.interaction.toJSON();
    
                    commandPayload.push(payload);
    
                    cmds.push(payload)
    
                    console.log(`Added ${m[0].toUpperCase() + m.slice(1)}/${command.name}`);
                }
            } else console.error(`Command ${m[0].toUpperCase() + m.slice(1)}/${`${cmd}`.toLowerCase().replace(`.js`, ``)} does not export an object, has no function, or has no interaction object! Will not be imported.`)
        }

        let description = ``;

        if(require('fs').existsSync(`./core/commandHandler/cmdModules/${m}/settings.json`)) {
            try {
                const settings = require(`./${m}/settings.json`);
                if(settings.description) {
                    description = settings.description;
                } else description = `Module ${m[0].toUpperCase() + m.slice(1)}`;
            } catch(e) {
                description = `Module ${m[0].toUpperCase() + m.slice(1)}`;
            }
        } else description = `Module ${m[0].toUpperCase() + m.slice(1)}`;

        moduleList.push({...moduleSettings, name: m, description, cmds})
    }
    
    const commandNames = commandPayload.map(c => c.name.toLowerCase());
    
    const deletedCommands = existingCommands.filter(cmd => !commandNames.find(c => c == cmd.name.toLowerCase()));

    console.log(commandNames, deletedCommands.map(c => c.name), existingCommands.map(c => c.name))

    console.log(`\n> ${deletedCommands.length} to delete,\n> ${existingCommands.filter(cmd => commandNames.find(c => c == cmd.name.toLowerCase())).length} to update,\n> ${commandNames.filter(cmd => existingCommands.find(c => c.name.toLowerCase() == cmd) === undefined).length} to add.`)
    
    if(deletedCommands.length > 0) console.log(`There are ${deletedCommands.length} commands pending removal (${deletedCommands.slice(0, 3).map(c => c.name).join(`, `)}${deletedCommands.length > 3 ? `...` : ``})`);

    rest.put(Routes.applicationCommands(botID), { body: commandPayload }).then(cmds => {
        console.log(`\n -- Successfully updated command configuration! (${cmds.length}/${commandPayload.length}) -- \n`);
        res(cmds);
    }).catch(e => {
        // for some reason, rest api decides to exit the process with no error message -- this is literally impossible to mitigate.

        console.error(`Failed to update command configuration; ${e}`); res()
    })
})
const fs = require('fs');

const { token, botID, elevated } = require('../../config.json');

const { Routes } = require('discord-api-types/v9'), rest = new (require('@discordjs/rest').REST)({ version: '9' }).setToken(token);

module.exports = () => new Promise(async res => {
    console.log(`Fetching existing commands library from Discord API...`);
    let existingCommands;
    try {
        existingCommands = await rest.get(Routes.applicationCommands(botID));
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

            if(typeof c === `object` && typeof c.func == `function` && c.interaction) {
                let command = {
                    func: () => {},
                    options: {},
                    name: `${cmd}`.toLowerCase().replace(`.js`, ``),
                    description: `[${m[0].toUpperCase() + m.slice(1)}]`
                }

                if(c.interaction.description && `${c.interaction.description}`.length >= 5) c.interaction.setDescription(`[${m[0].toUpperCase() + m.slice(1)}] // ${c.interaction.description}`)

                if(!c.interaction.name) c.interaction.setName(`${cmd}`.toLowerCase().replace(`.js`, ``))

                if(moduleSettings.hidden && moduleSettings.hidden === true) c.interaction.setDefaultPermission(false)

                command = c.interaction.toJSON();
                command.func = c.func

                let payload = c.interaction.toJSON();

                commandPayload.push(payload);

                cmds.push(payload)

                console.log(`Added ${m[0].toUpperCase() + m.slice(1)}/${command.name}`);
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
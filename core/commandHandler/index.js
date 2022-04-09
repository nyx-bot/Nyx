const fs = require('fs')

const { token, botID, elevated } = require('../../config.json');
const { Routes } = require('discord-api-types/v9');
const rest = new (require('@discordjs/rest').REST)({ version: '9' }).setToken(token);

module.exports = async () => {
    const existingCommands = await rest.get(Routes.applicationCommands(botID));
    const modules = fs.readdirSync(`./core/commandHandler/cmdModules`);
    console.log(`Importing ${modules.length} modules...`);
    
    global.ctx.modules = {}
    global.ctx.cmdModuleMap = new Map();
    global.ctx.moduleGlobalMap = new Map();

    for(dir of modules) await new Promise(async res => {
        const m = `${dir}`
        console.log(`Importing "${m}"`)

        let moduleObject = {
            hidden: false,
            // hidden: dictates if the module will be hidden to the public. this
            // would be generally used for modules that could be an easter egg, or
            // modules that would be solely for nyx administrator usage.
            // true: this module will be hidden from the public
            // false: this module is NOT going to be hidden from the public

            systemModule: false,
            // systemModule: dictates if the module is vital to the system's usage.
            // true: This module is NOT locked, and can be disabled per server.
            // false: This module IS LOCKED, and CANNOT be disabled per server.
    
            friendlyName: m[0].toUpperCase() + m.slice(1),
            // friendlyName: the name of the module that is shown in info cards.
            // undefined / null: directory name.

            description: null,
            // description: add a little description to help describe the module's purpose to the user.
            // null: no description will be shown.
            // string: a description will be shown on info cards.

            emoji: `<:nyx:732595012617109531>`,
            // emoji: which emoji will be used to represent the module? this will be shown primarily
            // in the help menu, and the buttons to switch modules
            // undefined / anything but a string: will use default emoji listed above
            // string: will use emoji in placeholders if it's available

            aliases: [],
            // aliases: establish multiple reference names to one module; increases ease of use,
            // especially when adapting from one bot's likeness to another.
            // undefined / empty object/array: no extra aliases will be applied.
            // array with properties inside: aliases will be applied; filtered by string.

            commands: {}
        };

        const moduleDir = fs.readdirSync(`./core/commandHandler/cmdModules/${m}/`);

        if(moduleDir.find(file => file === `settings.json`)) {
            const moduleSettings = require(`./cmdModules/${m}/settings.json`);
            for(preference of Object.entries(moduleSettings)) {
                if(moduleObject[preference[0]] !== undefined) {
                    if(preference[0].toLowerCase() == `emoji`) {
                        moduleObject[preference[0]] = ctx && ctx.emojis && ctx.emojis.nyx[preference[1]] ? ctx.emojis.nyx[preference[1]] : preference[1]
                        console.log(`> Set module variable "${preference[0]}" to "${moduleObject[preference[0]]}"`)
                    } else {
                        moduleObject[preference[0]] = preference[1]
                        console.log(`> Set module variable "${preference[0]}" to "${moduleObject[preference[0]]}"`)
                    }
                } else {
                    console.error(`> Module variable "${preference[0]}" is not a valid variable!`)
                };
            }
        };

        global.ctx.moduleGlobalMap.set(m.toLowerCase(), m.toLowerCase())

        if(moduleObject.aliases && typeof moduleObject.aliases == `object` && moduleObject.aliases.filter(n => typeof n === `string`).length > 0) {
            for(alias of moduleObject.aliases.filter(n => typeof n === `string`)) {
                global.ctx.moduleGlobalMap.set(alias.toLowerCase(), m.toLowerCase())
            }
        };

        console.log(`>_ -- Commands: --`)

        const commands = moduleDir.filter(f => f.endsWith(`.js`));

        for(cmd of commands) {
            const c = require(`./cmdModules/${m}/${cmd}`);

            if(typeof c === `object` && typeof c.func == `function`) {
                let command = existingCommands.find(command => command.name.toLowerCase() == (c.interaction && c.interaction.name ? c.interaction.name : `${cmd.replace(`.js`, ``)}`).toLowerCase())
                command.func = c.func;
                if(c.buttonFunc) command.buttonFunc = c.buttonFunc
                moduleObject.commands[cmd.toLowerCase().replace(`.js`, ``)] = command;
                global.ctx.cmdModuleMap.set(`${cmd.replace(`.js`, ``)}`, m);
                console.log(`> | ${command.name} ${c.buttonFunc ? `[+ BUTTON]` : ``}`)
            } else console.error(`> | ${c} does not export an object, or has no function! Will not be imported.`)
        }

        global.ctx.modules[m.toLowerCase()] = moduleObject;

        res()
    })
}
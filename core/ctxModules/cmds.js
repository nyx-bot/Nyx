const fs = require('fs')

let cmds = {}

const modules = fs.readdirSync(`./core/cmdModules/`);

for (m of modules) {
    try {
        const commands = fs.readdirSync(`./core/cmdModules/${m}/`);
        console.d(`Adding module ${m} with ${commands.length} cmd(s)`);

        for (cmd of commands) {
            let friendlyName = cmd.split(`.`).slice(0, -1).join(`.`);
            console.d(`> Adding command ${friendlyName} (${cmd}) from module ${m}`);

            if(!cmds[m]) cmds[m] = {};

            const langs = fs.readdirSync(`./lang/`).filter(lang => fs.existsSync(`./lang/${lang}/${m}/${friendlyName}.json`)).map(lang => `./lang/${lang}/${m}/${friendlyName}.json`);

            console.d(`> Available languages for command ${friendlyName}:\n> | ${langs.map(l => l.split(`/`).slice(2,3)[0]).join(`\n> | `)}`);

            let languages = {};

            langs.forEach(l => {
                languages[l.split(`/`).slice(2,3)[0]] = require(`../../${l}`)
            })

            const primary = require(`../../lang/en-US/${m}/${friendlyName}`);

            langs.forEach(lang => {
                let primaryKeys = Object.keys(primary), langKeys = Object.keys(require(`../../${lang}`));

                langKeys.forEach(key => {
                    if(primaryKeys.find(s => s == key)) primaryKeys.splice(primaryKeys.indexOf(key), 1);
                });

                if(primaryKeys.length != 0) {
                    console.warn(`Language ${lang.split(`/`).slice(2,3)[0]} of command ${friendlyName} in module ${m} has a difference of ${primaryKeys.length} keys:`);
                    primaryKeys.forEach(k => {
                        languages[lang.split(`/`).slice(2,3)[0]] = primary[k]
                        console.warn(`- Missing: ${k} (Default value: "${languages[lang.split(`/`).slice(2,3)[0]]}")`);
                    });
                    console.warn(`Make sure your language directory is up to date with the command \`git submodule update --remote\``)
                }
            })
            
            cmds[m][friendlyName] = {
                func: require(`../cmdModules/${m}/${cmd}`),
            }
        }
    } catch(e) {
        //console.w(`Failed adding command module "${m}" -- ${e}`)
    }
};

console.d(`Commands object:`, require('util').inspect(cmds, false, 3))

module.exports = cmds
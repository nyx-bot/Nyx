const fs = require('fs')

module.exports = (m, cmd, name) => {
    console.d(`> Reading command ${name} (${cmd}) from module ${m}`);

    const langs = fs.readdirSync(`./lang/`).filter(lang => fs.existsSync(`./lang/${lang}/${m}/${name}.json`)).map(lang => `./lang/${lang}/${m}/${name}.json`);

    let languages = {};

    langs.forEach(l => {
        languages[l.split(`/`).slice(2,3)[0]] = require(`../${l}`)
    })

    console.d(`> Available languages for command ${name}:\n> | ${langs.map(l => l.split(`/`).slice(2,3)[0]).map(l => `${l} (${languages[l].command && languages[l].command.name ? languages[l].command.name : name})`).join(`\n> | `)}`);

    const primary = require(`../lang/en-US/${m}/${name}`);

    langs.forEach(lang => {
        let primaryKeys = Object.keys(primary), langKeys = Object.keys(require(`../${lang}`));

        langKeys.forEach(key => {
            if(primaryKeys.find(s => s == key)) primaryKeys.splice(primaryKeys.indexOf(key), 1);
        });

        if(primaryKeys.length != 0) {
            languages[lang.split(`/`).slice(2,3)[0]].missingValues = true;
            console.warn(`Language ${lang.split(`/`).slice(2,3)[0]} of command ${name} in module ${m} has a difference of ${primaryKeys.length} keys:`);
            primaryKeys.forEach(k => {
                languages[lang.split(`/`).slice(2,3)[0]][k] = primary[k]
                console.warn(`- Missing: ${k} (Default value: "${languages[lang.split(`/`).slice(2,3)[0]][k]}")`);
            });
            console.warn(`Make sure your language directory is up to date with the command \`git submodule update --remote\``)
        }
    });

    const cmdObj = {
        languages,
        func: require(`./client/cmdModules/${m}/${cmd}`),
    };

    return cmdObj;
}
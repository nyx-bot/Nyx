const fs = require('fs')

const utils = fs.readdirSync(`./util/`)

let utilObject = {};

console.debug(`${utils.length} utils to add!`)

for(file of utils) {
    if(file.toLowerCase().endsWith(`.js`) || file.toLowerCase().endsWith(`.json`)) {
        let name = file.split(`.`).slice(0, -1).join(`.`);
        try {
            utilObject[name] = require(`../../../util/${file}`);
            console.debug(`${file} -- successfully added as type ${typeof utilObject[name]}`)
        } catch(e) {
            console.debug(`${file} -- failed to add: ${e}`)
        }
    } else console.debug(`${file} -- skipping; is not a JS or JSON file!`)
};

module.exports = utilObject
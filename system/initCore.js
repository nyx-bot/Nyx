const fs = require('fs');

module.exports = () => {
    let core = {};

    for(let util of fs.readdirSync(`./core`).filter(f => f.endsWith(`.js`))) {
        try {
            console.d(`[CORE] Reading ${util.split(`.`)[0]}...`);
            core[util.split(`.`)[0]] = require(`../core/${util}`);
        } catch(e) {
            console.error(`Failed to import core func ${util.split(`.`)[0]} (${util}):`, e)
        }
    };

    return core;
}
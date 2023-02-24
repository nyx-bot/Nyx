const fs = require('fs');

module.exports = () => {
    let utils = {};

    for(let util of fs.readdirSync(`./utils`).filter(f => f.endsWith(`.js`))) {
        try {
            console.d(`[UTIL] Reading ${util.split(`.`)[0]}...`);
            utils[util.split(`.`)[0]] = require(`../utils/${util}`);
            //console.d(require(`../utils/${util}`))
        } catch(e) {
            console.error(`Failed to import util ${util.split(`.`)[0]} (${util}):`, e)
        }
    };

    return utils;
}
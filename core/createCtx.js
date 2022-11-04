const fs = require('fs')

module.exports = () => {
    const ctx = {};

    const modules = fs.readdirSync(`./core/ctxModules`).filter(m => m.endsWith(`.js`) || m.endsWith(`.json`));

    for(file of modules) {
        const name = file.split(`.`).slice(0, -1).join(`.`)
        try {
            ctx[name] = require(`./ctxModules/${file}`);
            console.debug(`[CTX] Added ${name} (${typeof ctx[name]})`)
        } catch(e) {
            console.warn(`[CTX] Failed to load ctx module ${file}! (${e})`)
        }
    };

    return ctx;
}
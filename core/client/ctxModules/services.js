const serviceFiles = require('fs').readdirSync(`./core/services`).filter(s => s.endsWith(`.js`))

console.debug(`There are ${serviceFiles.length} services!`)

const services = [];

for (f of serviceFiles) {
    console.d(`Adding ${f}...`);

    try {
        services.push(require(`../../services/${f}`))
    } catch(e) {
        console.error(`Failed to add ${f} as a service! (${e})`)
    }
}

module.exports = services
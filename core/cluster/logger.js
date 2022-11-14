const debug = process.argv.find(a => a.toLowerCase() == `debug`) ? true : false

const c = {
    reset: "\x1b[0m", bold: "\x1b[1m", italic: "\x1b[3m", underline: "\x1b[4m", strike: "\x1b[9m", clearline: "\x1b[K",
    black: "\x1b[30m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", blue: "\x1b[34m", magenta: "\x1b[35m", cyan: "\x1b[36m", white: "\x1b[37m",
    blackbg: "\x1b[40m", redbg: "\x1b[41m", greenbg: "\x1b[42m", yellowbg: "\x1b[43m", bluebg: "\x1b[44m", magentabg: "\x1b[45m", cyanbg: "\x1b[46m", whitebg: "\x1b[47m"
}; 

const tag = (type, colors, cluster) => {
    let tagTypeLength = 5

    let beforeTrim = ` `.repeat(Math.floor((tagTypeLength - type.length)/2))
    let afterTrim = ` `.repeat(Math.ceil((tagTypeLength - type.length)/2))

    return colors.join(``) + `┃` + ` ${`${cluster}`.length === 1 ? `0${cluster}` : cluster}` + c.reset + colors[1] + ` ${beforeTrim}${type.toUpperCase()}${afterTrim}` + c.reset + ` `
}

let types = [
    [`debug`, c.bold, c.cyan], 
    [`info`, c.bold, c.white], 
    [`error`, c.bold, c.red], 
    [`warn`, c.bold, c.yellow], 
    [`log`, c.bold, c.white],
    [`main`, c.bold, c.magenta],
];

let logChannels = {};

types.forEach(rawtype => {
    let type = rawtype[0], colors = rawtype.slice(1)

    if(console[type]) console[`original${type}`] = console[type]
    if(console[type[0]]) console[`original${type[0]}`] = console[type[0]]

    const func = (c, ...m) => m.forEach(msg => {
        try {
            let thisTag = tag(type, colors, c);
            console[`original${type}`](`${thisTag} ` + (typeof msg == `string` ? msg : require("util").inspect(msg, { depth: 0 })).split(`\n`).join(`\n${thisTag} `))
        } catch(e) {
            console[`originalerror`](e)
        }
    });

    logChannels[type] = func
    console[type] = (...d) => func(`--`, ...d);
    console[type[0]] = (...d) => func(`--`, ...d);

    if(!debug) logChannels[`debug`] = () => {}
});

module.exports = logChannels
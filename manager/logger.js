const c = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    italic: "\x1b[3m",
    underline: "\x1b[4m",
    strike: "\x1b[9m",
    clearline: "\x1b[K",
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    blackbg: "\x1b[40m",
    redbg: "\x1b[41m",
    greenbg: "\x1b[42m",
    yellowbg: "\x1b[43m",
    bluebg: "\x1b[44m",
    magentabg: "\x1b[45m",
    cyanbg: "\x1b[46m",
    whitebg: "\x1b[47m"
}; 

const tag = (type, colors, cluster) => {
    let beforeTrim = ` `.repeat(Math.floor((6 - type.length)/2))
    let afterTrim = ` `.repeat(Math.ceil((6 - type.length)/2))

    return colors.join(``) + `${`[ ${beforeTrim}${type.toUpperCase()}${afterTrim} / ${`${cluster}`.length === 1 ? `0${cluster}` : cluster} ]`}`.trim() + c.reset
}

let types = [
    [`debug`, c.cyanbg], 
    [`info`, c.whitebg, c.black], 
    [`error`, c.redbg], 
    [`warn`, c.yellowbg, c.black], 
    [`log`, c.whitebg, c.black]
];

let logChannels = {};

types.forEach(rawtype => {
    let type = rawtype[0], colors = rawtype.slice(2)

    console.log(`setting log function ${type} with tag ${tag(type, [])}`)

    logChannels[type] = (c, ...m) => m.forEach(msg => {
        try {
            let thisTag = tag(type, colors, c);
            console.log(`${thisTag} ` + (typeof msg == `string` ? msg : require("util").inspect(msg, { depth: 0 })).split(`\n`).map(s => s.trim()).join(`\n${thisTag} `))
        } catch(e) {
            console.error(e)
        }
    })
});

console.log(logChannels)

module.exports = logChannels
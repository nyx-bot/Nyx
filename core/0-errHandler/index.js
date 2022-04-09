const fs = require('fs')

const weekday = [
    `Sunday`,
    `Monday`,
    `Tuesday`,
    `Wednesday`,
    `Thursday`,
    `Friday`,
    `Saturday`
], month = [
    `January`,
    `February`,
    `March`,
    `April`,
    `May`,
    `June`,
    `July`,
    `August`,
    `September`,
    `October`,
    `November`,
    `December`
]

module.exports = () => new Promise(async res => {
    console.originalErrorFunc = console.error;

    let validJSFiles = [];

    console.log(`\n -- Creating list of debuggable logs... -- \n`)
    
    const scanDir = (dir, base) => {
        const res = fs.readdirSync(dir).filter(f => base === true ? f !== `node_modules` && !f.startsWith(`.`) : true);
        let found = [], foundInSubdirectories = 0, subdirectories = 0;
        for(f of res) {
            if(fs.existsSync(`${dir.endsWith(`/`) ? `${dir}` : `${dir}/`}${f}/`)) {
                subdirectories++;
                foundInSubdirectories = foundInSubdirectories + scanDir(`${dir.endsWith(`/`) ? `${dir}` : `${dir}/`}${f}/`)
            } else if(f.endsWith(`.js`) && !f.endsWith(`.json`)) {
                found.push(f); 
                validJSFiles.push(`${dir.endsWith(`/`) ? `${dir}` : `${dir}/`}${f}`)
            }
        }
        console.log(`> ${dir}: (${found.length}) debuggable file${found.length === 1 ? `` : `s`}${found.length > 0 ? `\n> - [ ` + found.join(`, `) + ` ]` : ``}${foundInSubdirectories.length > 0 ? `\n> - (+ ${foundInSubdirectories.length} in ${subdirectories} subdirectorie${subdirectories === 1 ? `` : `s`})` : ``}`);
        return found;
    }; scanDir(require.main.filename.split(`/`).slice(0, -1).join(`/`), true);

    console.log(`\n -- Found ${validJSFiles.length} files to debug -- \n`);

    const regex = new RegExp(`(${validJSFiles.filter(f => !f.includes(`errHandler/index`)).map(g => g.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + `:\\d*:\\d*`).join(`|`)})`, `gi`);

    ctx.errMsg = (...params) => require('./responses')(...params)

    console.error = ((...err) => new Promise(async res => {
        if(err.filter(e => `${e}`.toLowerCase().includes(`unknown interaction`)).length === 0) {
            console.log(err.map(e => `${e}`.toLowerCase()).join(`\n`))
            console.originalErrorFunc(...err);
    
            const eid = typeof err[0] == `object` && err[0].errorIDProvided && err[0].errorIDProvided.length === 16 ? err.shift().errorIDProvided : null
    
            const mainDir = require.main.filename.split('/').slice(0, -1).join('/');
            
            if(fs.existsSync(mainDir + `/config.json`)) try {
                if(typeof require(mainDir + `/config.json`).discordErrorWebhook == `string` && require(mainDir + `/config.json`).discordErrorWebhook.length > 20) try {
                    const config = require(mainDir + `/config.json`);
    
                    const payload = {
                        content: ``,
                        files: []
                    };
            
                    if(typeof ctx == `object` && ctx.bot && ctx.bot.user && ctx.bot.user.username) {
                        payload.content = `${err.length} error${err.length === 1 ? `` : `s`} from ${ctx.bot.user.username}`
                    } else if(config.botID && typeof config.botID == `string`) {
                        payload.content = `${err.length} error${err.length === 1 ? `` : `s`} from { uninitialized client ${config.botID} }`
                    } else {
                        payload.content = `${err.length} error${err.length === 1 ? `` : `s`} from { uninitialized client }`
                    };
    
                    if(eid) payload.content = `[EID: ${eid}] // ` + payload.content;
                        
                    const time = new Date(), rawOffsetInMs = time.getTimezoneOffset()*60000;
                    const timeParser = require('../../util/time');
    
                    const { timestamp } = timeParser((time.getTime()+(time.getTimezoneOffset()*-60000)) % 86400000)
        
                    let s = {
                        weekday: weekday[time.getDay()],
                        month: month[time.getMonth()],
                        day: `${time.getDate()}`,
    
                        year: `${time.getFullYear()}`,
    
                                // for some reason, javascript's time offset
                                // is reversed; +06:00 = -360, and -06:00 = 360
                                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset#negative_values_and_positive_values
                        offset: time.getTimezoneOffset() > 0 ? `-${timeParser(rawOffsetInMs).timestamp}` : `${timeParser(rawOffsetInMs).timestamp}`
                    }; let footer = { text: `${s.weekday}, ${s.month} ${s.day}, ${s.year} at ${timestamp} [UTC ${s.offset}]` }
    
                    const attachmentVariables = {}
    
                    const fullStack = new Error().stack.split(`\n    `).slice(1);
    
                    const fromFile = fullStack.join(`\n`).match(regex) ? fullStack.join(`\n`).match(regex)[0] : fullStack.join(`\n`).match(regex); 
                    
                    if(fromFile) {
                        let file = fs.readFileSync(fromFile.split(`:`)[0], { encoding: `utf8` }).split(`\n`);
                        const pos = fromFile.split(`:`).slice(1);
            
                        const lnRange = [
                            Number(pos[0]) - 5 < 1 ? 1 : Number(pos[0]) - 5,
                            Number(pos[0]) + 5 > file.length ? file.length : Number(pos[0]) + 5,
                        ];
                        
                        let lines = [];
                        let blankOffset = !file[Number(pos[0])-1].startsWith(`  `) ? `  ` : ``;
                
                        file[Number(pos[0])-1] = blankOffset === `  ` ? `> ` + file[Number(pos[0])-1] : `> ` + file[Number(pos[0])-1].substring(2);
                        file[Number(pos[0])-1] = file[Number(pos[0])-1] + `\n${` `.repeat(Number(pos[1])+1)}^`
                
                        let at = lnRange[0]-1; while(at++ < lnRange[1]) lines.push(`${file[at-1]}`);
    
                        attachmentVariables.at = {
                            file: `${fromFile}`,
                            fullStack: fullStack.map(s => s.split(`:`)[0]),
                            location: lines
                        };
                    } else attachmentVariables.at = fullStack
    
                    attachmentVariables.messages = {}
    
                    for(e in err) attachmentVariables.messages[`${e} [${typeof err[e]}]`] = (require("util").inspect(err[e], { depth: 1 }));
    
                    payload.files.push({ 
                        name: `err.txt`,
                        attachment: Buffer.from(`-- REPORT GENERATED AT ${footer.text.toUpperCase()} --\n\n${Object.entries(attachmentVariables).map(variable => 
                            typeof variable[1] == `object` ? 
                            `${`${variable[0]}`.toUpperCase()}:\n| ${Object.entries(variable[1]).map(v => 
                                `\n| ${`${v[0]}`.toUpperCase()}:\n| > ${`${v[1].join ?                      // object handling
                                    v[1].join(`\n`) : `${v[1]}` // if the variable is an array, join it with newlines
                                }`.replace(/\n/g, `\n| > `)}`).join(`\n| `)}` 
                                : `${
                                    `${variable[0]}`.toUpperCase()                                          // string handling
                                }:\n| ${
                                    `${variable[1]}`.replace(/\n/g, `\n| `)
                                }`).join(`\n\n${`-`.repeat(100)}\n\n`)
                            }\n| `
                        )
                    })
    
                    try {
                        new (require('discord.js').WebhookClient)({ url: config.discordErrorWebhook }).send(payload).then(() => {})
                    } catch(e) {
                        console.originalErrorFunc(`^ Unable to report above error; `, e)
                        require('superagent').post(config.discordErrorWebhook)
                        .send({...payload, files: undefined})
                    }
                } catch(e) {
                    res(console.originalErrorFunc(`^ Unable to report above error; `, e))
                } else res(console.originalErrorFunc(`^ Unable to report above error; no Discord Error Webhook URL is present in your config!`))
            } catch(e) {res(console.originalErrorFunc(`^ Unable to report above error; config file may be malformed!`))}
        }
    })); res();

    console.errorWithEID = (id, ...err) => new Promise(async (res) => {
        if(typeof id == `string` && id.length === 16) {
            return console.error({ errorIDProvided: id }, ...err).then(res)
        } else {
            if(typeof id == `object`) return console.error(...err).then(res)
        }
    });

    const handle = (...content) => {
        if(`${content[0]}`.toLowerCase().includes(`unknown interaction`) || `${content[1]}`.toLowerCase().includes(`unknown interaction`)) {
            return
        } else console.error(...content)
    }

    process.on('unhandledRejection', handle);
    process.on('uncaughtException', handle);
    process.on('rejectionHandled', handle);
})
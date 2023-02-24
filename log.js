const L = async (ctx) => {
    if(ctx.logsInitiated === true) return;
    ctx.logsInitiated = true;
    console.l = (...m) => {
        m.forEach(msg => {
            console.log(`[INFO-OUT]`, msg)
        })
    }
    console.w = (...m) => {
        m.forEach(msg => {
            console.log(`[WARN-OUT]`, msg)
        })
    }
    console.e = (...m) => {
        m.forEach(msg => {
            console.log(`[INFO-ERR]`, msg)
        })
    }
    console.de = (...m) => {
        m.forEach(msg => {
            console.log(`[DEBUG-ERR]`, msg)
        })
    }
    console.d = (...m) => {
        m.forEach(msg => {
            console.log(`[DEBUG-OUT]`, msg)
        })
    }

    if(!require('fs').existsSync(`./etc/`)) require('fs').mkdirSync(`./etc/`);
    const fs = require('fs'); const moment = require('moment');
    fs.appendFileSync(`./etc/debug.log`, `-- BOT CLIENT INITIATED AT ${(moment().format(`MMM DD [at] hh:mm:ss A`)).toUpperCase()} --\n`)
}; L.classic = async (ctx) => {
    try {
        if(!require('fs').existsSync(`./etc/`)) require('fs').mkdirSync(`./etc/`);
        const compatibilityThingy = (...content) => {
            for(i in content) {
                if(typeof content[i] == `object`) {
                    if(typeof content[i].length == `number` && typeof content[i].forEach == `function`) {
                        if(content[i].length === 1) {content[i] = content[i][0]} else {
                            content[i] = `ARRAY: [${Object.entries(content[i]).splice(0).map(
                                o => {
                                    if(`${o[0]}`.startsWith(`_`)) {return ``} else {return `${
                                        `\n\n     - ${typeof o[1] == `object` ? // add entry key
                                        `${JSON.stringify(o[1]).replace(/\n/g, `\n      `).substring(0, 7500)}` : // if entry value is json, stringify.
                                        `${`${o[1]}`.replace(/\n/g, `\n       `).substring(0, 7500)}`}`}` // else, just enter it as a string, but  b e a u t i f i e d .
                                    }
                                }
                            )}\n\n]`.replace(/,,/g, `,`)
                        }
                    } else {
                        content[i] = `OBJECT: {${Object.entries(content[i]).splice(0).map(
                            o => {
                                if(`${o[0]}`.startsWith(`_`)) {return ``} else {return `${
                                    `\n\n     ${o[0]}\n     - ${typeof o[1] == `object` ? // add entry key
                                    `${JSON.stringify(o[1]).replace(/\n/g, `\n      `).substring(0, 7500)}` : // if entry value is json, stringify.
                                    `${`${o[1]}`.replace(/\n/g, `\n       `).substring(0, 7500)}`}`}` // else, just enter it as a string, but  b e a u t i f i e d .
                                }
                            }
                        )}\n\n}`.replace(/,,/g, `,`)
                    }
                } else content[i] = `${content[i]}`;
            }; return content;
        }
    
        if(ctx.logsInitiated === true) return;
        ctx.logsInitiated = true;
        const tmout = (ms) => new Promise(r => setTimeout(r, ms))
    
        require('fs').appendFileSync(`./etc/debug.log`, `\n\n-- STARTED AT ${(require(`moment`)().format(`MMM DD [at] hh:mm:ss A`)).toUpperCase()} --\n`)
    
        const logger = require('node-color-log');
        const fs = require('fs');
        const moment = require('moment');
    
        logger.setLevelColor();
    
        ctx.debugAppendQueue = [];
        let pauseAppend = false;
        
        ctx.getLogQueue = () => new Promise(async res => {
            const dAQ = ctx.debugAppendQueue.splice(0);
            ctx.debugAppendQueue = [];
    
            let writables = []
        
            for (latest of dAQ) {
                const date = moment(latest[2]).format(`MMM DD YYYY - hh:mm:ss A`).toUpperCase()
                if(typeof latest[1] == `string`) {
                    latest = `\n${date} [${latest[0]}]> ${latest[1].replace(/\n/g, `\n${date} [${latest[0]}]> `)}`
                    writables.push(latest)
                } else if(latest[1]) {
                    if(latest[1] && latest[1].toString) latest[1] = latest[1].toString();
                    latest[1] = `${latest[1]}`
                    latest = `\n${date} [${latest[0]}]> ${latest[1].replace(/\n/g, `\n${date} [${latest[0]}]> `)}`
                    writables.push(latest)
                }
            };
    
            res(writables);
        })
    
        ctx.cleanupDebug = async () => {
            if(pauseAppend === true) return;
            if(fs.existsSync(`./etc/debug.log`)) {
                console.d(`cleanupDebug called.`)
                pauseAppend = true;
                await tmout(1200)
    
                const logs = fs.readFileSync(`./etc/debug.log`).toString().split('\n');
                const max = 1250000
    
                console.d(`log lines: ${logs.length}/${max}`)
    
                if(logs.length > max) {
                    const writables = await ctx.getLogQueue()
    
                    const amount = (logs.length - max) + writables.length;
    
                    console.d(`lines to remove from beginning: ${amount - writables.length}${writables.length !== 0 ? ` (+${writables.length} for new lines)` : ``}`)
    
                    logs.splice(0, amount);
    
                    const toWrite = logs.join('\n') + writables.join('');
    
                    fs.writeFileSync(`./etc/debug.log`, toWrite);
                    pauseAppend = false;
                    console.d(`debug.log file trimmed from beginning by ${amount} lines.`)
                } else pauseAppend = false;
            }
        }
    
        const debugFileFilter = [
            `recent events`,
            `event counts`,
        ]
    
        console.l = (...msg) => {
            msg = compatibilityThingy(...msg);
            msg.forEach(m => {
                ctx.debugAppendQueue.push([`L`, m, Date.now()])
                logger.log(m)
            })
        }
        console.w = (...msg) => {
            msg = compatibilityThingy(msg);
            msg.forEach(m => {
                ctx.debugAppendQueue.push([`W`, m, Date.now()])
                logger.fontColorLog('yellow', [m])
            })
        }
        console.e = (...msg) => {
            msg = compatibilityThingy(msg);
            msg.forEach(m => {
                ctx.debugAppendQueue.push([`E`, m, Date.now()])
                logger.fontColorLog('red', [m]);
            })
        }
        console.de = (...msg) => { // ERROR LOGGING ONLY AVAILABLE FROM CONSOLE IF DEBUG IS ENABLED, OTHERWISE WILL BE IN debug.log
            msg = compatibilityThingy(msg);
            msg.forEach(m => {
                ctx.debugAppendQueue.push([`E`, m, Date.now()])
                if(ctx && ctx.debug == true) {
                    logger.fontColorLog('red', [m])
                }
            })
        };
        console.d = (...msg) => {
            msg = compatibilityThingy(msg);
            msg.forEach(m => {
                if(!debugFileFilter.find(n => `${`${m}`.toLowerCase()}`.includes(`${n.toLowerCase()}`))) ctx.debugAppendQueue.push([`D`, m, Date.now()])
                if(ctx && ctx.debug == true) {
                    logger.fontColorLog('blue', [m])
                }
            })
        };
    
        while(true) {
            if(pauseAppend) {
                while(pauseAppend) {
                    await tmout(5000)
                }
            }
    
            if(ctx.debugAppendQueue[0] !== undefined) {
                let writables = await ctx.getLogQueue()
                fs.appendFileSync(`./etc/debug.log`, writables.join(''));
            }
    
            await tmout(1000)
        }
    } catch(e) {console.error(`log err`, e)}
};

module.exports = L
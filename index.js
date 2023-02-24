const fs = require('fs-extra');
const beginningUpdated = `${fs.statSync(`./index.js`).mtimeMs}`;
const { fork, execSync } = require('child_process');
const tmout = (ms) => new Promise(r => setTimeout(r, ms));
const moment = require('moment');
const logDebugs = process.argv.find(s => s.includes(`debug`)) || fs.existsSync(`./config.json`) ? require(`./config.json`).debug || false : false;
//const logDebugs = true; // always log debugs; no point in not doing it

let io = null;

try {
    io = require(`@pm2/io`);
} catch(e) {
    console.warn(`PM2 io is not present on this system; skipping...`);
};

let pm2Metrics = {};

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

const clearLogs = (p) => new Promise(async res => {
    if(fs.existsSync(`./etc/debug.log`)) {
        const log = p ? p.sysLog : console.log
        log(`Cleaning up the debug.log file...`)

        const logs = fs.readFileSync(`./etc/debug.log`).toString().split('\n');
        const max = 350000

        log(`Debug log lines: ${logs.length}/${max}`)

        if(logs.length > max) {
            const amount = (logs.length - max);

            log(`Debug lines to remove from beginning: ${amount}`)

            logs.splice(0, amount);

            const toWrite = logs.join('\n');

            fs.writeFileSync(`./etc/debug.log`, toWrite);
            log(`debug.log file trimmed from beginning by ${amount} lines.`);
            res()
        } else res()
    } else res()
});

new Promise(async res => {
    await clearLogs()

    if(!fs.existsSync(`./etc/`)) fs.mkdirSync(`./etc/`);
    fs.appendFileSync(`./etc/debug.log`, `\n\n-- STARTED AT ${(moment().format(`MMM DD [at] hh:mm:ss A`)).toUpperCase()} --\n`);

    let ctx = {};

    let debugAppendQueue = [];
            
    let getLogQueue = () => new Promise(async res => {
        const dAQ = debugAppendQueue.splice(0);
        debugAppendQueue = [];
    
        let writables = []
    
        for (latest of dAQ) {
            const date = moment(latest[2]).format(`MMM DD YYYY - hh:mm:ss A`).toUpperCase()
            if(typeof latest[1] !== `string` && latest[1] && latest[1].toString) latest[1] = `${latest[1].toString()}`;
            if(typeof latest[1] == `string`) {
                latest = `\n${date} [${latest[0]}]> ${latest[1].replace(/\n/g, `\n${date} [${latest[0]}]> `)}`
                writables.push(latest)
            } else if(latest[1]) {
                latest = `\n${date} [${latest[0]}]> ${latest[1].replace(/\n/g, `\n${date} [${latest[0]}]> `)}`
                writables.push(latest)
            }
        }; res(writables);
    })
    
    const debugFileFilter = [
        `recent events`,
        `event counts`,
    ];

    ctx.out = log => {
        debugAppendQueue.push([` LOG  `, log, Date.now()]);
        let s = ` ${c.bold}${c.whitebg}${c.black}[INFO]${c.reset}   `
        console.log(`${s}| ${log.split(`\n`).join(`\n${s}| `)}`);
    }; ctx.warn = log => {
        debugAppendQueue.push([`WARN  `, log, Date.now()]);
        let s = ` ${c.bold}${c.yellowbg}${c.black}[WARN]${c.reset}   `
        console.log(`${s}| ${log.split(`\n`).join(`\n${s}| `)}`);
    }; ctx.err = log => {
        debugAppendQueue.push([`ERROR `, log, Date.now()]);
        let s = ` ${c.bold}${c.redbg}${c.black}[ERROR]${c.reset}  `
        if(!logDebugs) console.log(`${s}| ${log.split(`\n`).join(`\n${s}| `)}`);
    }; ctx.debug = log => {
        if(!debugFileFilter.find(n => (`${log}`.toLowerCase()).includes(`${n.toLowerCase()}`))) debugAppendQueue.push([`DEBUG `, log, Date.now()]);
        let s = ` ${c.bold}${c.cyanbg}${c.black}[DEBUG]${c.reset}  `
        if(logDebugs) console.log(`${s}| ${log.split(`\n`).join(`\n${s}| `)}`);
    }; ctx.debugerr = log => {
        debugAppendQueue.push([`DBGERR`, log, Date.now()]);
        let s = ` ${c.bold}${c.redbg}${c.black}[DBGERR]${c.reset} `
        if(logDebugs) console.log(`${s}| ${log.split(`\n`).join(`\n${s}| `)}`);
    }; ctx.rawerr = log => {
        debugAppendQueue.push([`RAWERR`, log, Date.now()]);
        let s = ` ${c.bold}${c.whitebg}${c.red}[RAWERR]${c.reset} `
        if(logDebugs) console.log(`${s}| ${log.split(`\n`).join(`\n${s}| `)}`);
    }; ctx.sysLog = log => {
        debugAppendQueue.push([`SYSTEM`, log, Date.now()]);
        let s = ` ${c.bold}${c.greenbg}${c.black}[SYSTEM]${c.reset} `
        console.log(`${s}| ${log.split(`\n`).join(`\n${s}| `)}`);
    }; ctx.sysLogCL = log => {
        debugAppendQueue.push([`SYSTEM`, log, Date.now()]);
        let s = ` ${c.bold}${c.greenbg}${c.black}[SYSTEM]${c.reset} `
        console.log(`${c.clearline}${s}| ${log.split(`\n`).join(`\n${c.clearline}${s}| `)}`);
    }; ctx.sysWarn = log => {
        debugAppendQueue.push([`SWARN `, log, Date.now()]);
        let s = ` ${c.bold}${c.yellowbg}${c.black}[SYSWRN]${c.reset} `
        console.log(`${s}| ${log.split(`\n`).join(`\n${s}| `)}`);
    }; ctx.sysErr = log => {
        debugAppendQueue.push([`SYSERR`, log, Date.now()]);
        let s = ` ${c.bold}${c.redbg}${c.black}[SYSERR]${c.reset} `
        console.log(`${s}| ${log.split(`\n`).join(`\n${s}| `)}`);
    }; 
    
    res(ctx); while(true) {
        if(debugAppendQueue[0] !== undefined) {
            let writables = await getLogQueue()
            fs.appendFileSync(`./etc/debug.log`, writables.join(''));
        }; await tmout(250)
    }
}).then(async log => {
    let botObj, nyx, lastStarted = Infinity;
    
    require('cron').job(`0 3 * * *`, /*runs every day at 3AM*/ async () => {
        if(lastStarted < 5.76e+7 + Date.now()) { // if running for 16 hours or more
            nyx.send(`exit`)
        }
    })

    const exitFunc = (code) => {
        console.log(`process exit called! (code: ${code})`)
        if(nyx && nyx.kill) nyx.kill(`SIGINT`);
        nyx.once(`close`, () => {
            console.log(`nyx is closed! exiting process...`);
            process.exit(0)
        })
    }

    process.on('beforeExit', exitFunc)
    process.on('exit', exitFunc)
    process.on('SIGINT', exitFunc)
    process.on('SIGTERM', exitFunc)
    process.on('SIGUSR1', exitFunc)
    process.on('SIGUSR2', exitFunc)

    const runProc = () => new Promise(async res => {
        lastStarted = Date.now();

        let args = [`nyxfork`]
        nyx = fork(`./bot.js`, args, {
            detached: false, 
            silent: true, 
            serialization: `advanced`
        }); 

        nyx.on(`exit`, i => {
            log.sysLog(`Nyx has existed with code ${i}`)
            res(i)
        })

        nyx.on(`message`, obj => {
            if(typeof obj == `object`) {
                if(obj.shards) {
                    botObj = obj.shards;
                    log.sysLog(`Previous shards saved in memory. (${botObj.length} total shards with ${botObj.filter(s => s[1] ? true : false).length} leftover session IDs)`)
                } else if(obj.type == `pm2Metrics`) {
                    if(io) for (o of Object.entries(obj.data)) {
                        if(!pm2Metrics[o[0]]) pm2Metrics[o[0]] = io.metric({
                            name: o[0],
                            id: 'app/realtime/' + o[0].split(` `).join(`_`).toLowerCase(),
                        });

                        if(pm2Metrics[o[0]].value !== o[1]) {
                            pm2Metrics[o[0]].set(o[1])
                        }
                    }
                };
            } else if(obj == `getShards`) {
                return // i can't figure this shit out for the life of me :(
                if(botObj) {
                    log.sysLog(`Sending previous shards to process`);
                    console.log(botObj)
                    nyx.send({
                        shards: botObj
                    }); botObj = undefined;
                } else log.sysLog(`No previous shards were cached.`);
            }
        })
        
        nyx.stdout.on(`data`, async data => {
            data = data.toString()
            try {
                if(!data.split(`\n`).reverse()[0].match(/[A-Za-zÀ-ÖØ-öø-ÿ]/)) data = data.split(`\n`).slice(0, -1).join(`\n`);
                if(data.startsWith(`[WARN-OUT]`))  log.warn(data.replace(/\[WARN-OUT\] /g, ``))
                else if(data.startsWith(`[DEBUG-OUT]`)) log.debug(data.replace(/\[DEBUG-OUT\] /g, ``))
                else if(data.startsWith(`[DEBUG-ERR]`)) log.debugerr(data.replace(/\[DEBUG-ERR\] /g, ``))
                else if(data.startsWith(`[INFO-ERR]`)) log.err(data.replace(/\[INFO-ERR\] /g, ``))
                else log.out(data.replace(/\[INFO-OUT\] /g, ``))
            } catch(e) {
                log.debug(`failed to parse log; categorized in debug`)
                log.debug(data)
            }
        });
    
        nyx.stderr.on(`data`, async data => {
            data = data.toString();
            try {
                if(!data.split(`\n`).reverse()[0].match(/[A-Za-zÀ-ÖØ-öø-ÿ]/)) data = data.split(`\n`).slice(0, -1).join(`\n`);
                log.debugerr(data.toString())
            } catch(e) {
                log.debugerr(`failed to parse err log; categorized in debugerr`)
                log.debugerr(data)
            }
        });
    });

    let ran = 0;
    while(true) {
        ran++;
        log.sysLog(`Starting Nyx... {${ran}}`);
        const i = await runProc();
        log.sysLog(`Exited with code ${i}`);

        const lastUpdated = fs.statSync(`./index.js`).mtimeMs;
        if(lastUpdated > beginningUpdated) {
            log.sysWarn(`The index script has been updated ever since it was ran.`);
            log.sysLog(`Quitting host process to apply the update!`); process.exit(0)
        };
        await clearLogs(log)
    }
})

const cp = require(`child_process`)

const logger = require('./core/cluster/logger');
global.errorHandler = require(`./core/errorHandler`);

process.on(`uncaughtException`, errorHandler)
process.on(`unhandledRejection`, errorHandler)

const config = require('./config.json');

require('./core/cluster/createSlashCommands')(config).then(async cmds => {
    let nyx, keepActive = true;

    let exitCount = 0;
    
    const exitFunc = (code) => {
        exitCount++;
        console.debug(`Process exit called! (code: ${code})`);

        if(exitCount >= 4) {
            console.warn(`Killing process.`)
        } else {
            keepActive = false;
            if(nyx && nyx.kill) nyx.kill(`SIGINT`);
        }
    }
    
    process.on('beforeExit', exitFunc)
    process.on('exit', exitFunc)
    process.on('SIGINT', exitFunc)
    process.on('SIGTERM', exitFunc)
    process.on('SIGUSR1', exitFunc)
    process.on('SIGUSR2', exitFunc)

    let startCount = 1

    while(keepActive) await new Promise(async restart => {
        console.log(`Starting Nyx! (#${startCount++})`)

        nyx = cp.fork(`./client.js`);
    
        nyx.on(`message`, opt => {
            try {
                if(logger[opt.name]) {
                    if(opt.name.toLowerCase() == `error` && errorHandler.find(opt.msg)) {
                        errorHandler(opt.msg)
                    } else logger[opt.name](startCount, opt.msg)
                }
            } catch(e) {console.error(e)}
        })

        nyx.on(`error`, e => {
            console.error(`Error occurred while forking client process!`, e)
        });
        
        nyx.once(`close`, (code, signal) => {
            console.log(`Client process closed ${code ? `with code ${code}` : `with signal ${signal}`}`);
            restart()
        })
    })
}).catch(errorHandler)
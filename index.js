const logger = require('./core/cluster/logger');
global.errorHandler = require(`./core/errorHandler`);

process.on(`uncaughtException`, errorHandler)
process.on(`unhandledRejection`, errorHandler)

const config = require('./config.json');

const { ClusterManager } = require('discord.js-cluster');

global.manager = new ClusterManager(`./client.js`, {
    token: config.token,
});

require('./core/cluster/createSlashCommands')().then(async cmds => {
    manager.on(`clusterCreate`, async cluster => {
        console.log(`Launched cluster ${Number(cluster.id)+1}`);
    
        cluster.on(`error`, e => {
            console.error(`--`, e)
        })
    
        cluster.on(`message`, opt => {
            try {
                if(logger[opt.name]) {
                    if(opt.name.toLowerCase() == `error` && errorHandler.find(opt.msg)) {
                        errorHandler(opt.msg)
                    } else logger[opt.name](Number(cluster.id)+1, opt.msg)
                }
            } catch(e) {console.error(e)}
        })
    
        cluster.on(`ready`, async () => {
            console.log(`Cluster ${Number(cluster.id)+1}/${manager.totalClusters} is ready!`);
            if(Number(cluster.id)+1 == manager.totalClusters) {
                console.log(`| Nyx is ready!\n| Serving ${(await (require('./util/getTotalServerCount')()))} guilds across ${manager.totalShards} shards & ${manager.totalClusters} clusters`)
            }
        })
    });
    
    try {
        manager.spawn();
    } catch(e) {
        console.error(`--`, `Failed to spawn cluster: ${e}`);
    }
}).catch(errorHandler)
const debug = process.argv.find(a => a.toLowerCase() == `debug`) ? true : false

const config = require('./config.json');

const { ClusterManager } = require('discord.js-cluster');

global.manager = new ClusterManager(`./client.js`, {
    token: config.token,
});

const logger = require('./manager/logger');

const log = (...d) => logger.main(`--`, ...d);

manager.on(`clusterCreate`, async cluster => {
    log(`Launched cluster ${Number(cluster.id)+1}`);

    cluster.on(`message`, opt => {
        try {
            if(logger[opt.name] && ((opt.name == `debug` && debug) || opt.name != `debug`)) {
                logger[opt.name](Number(cluster.id)+1, opt.msg)
            }
        } catch(e) {console.error(e)}
    })

    cluster.on(`ready`, async () => {
        log(`Cluster ${Number(cluster.id)+1}/${manager.totalClusters} is ready!`);
        if(Number(cluster.id)+1 == manager.totalClusters) {
            log(`| Nyx is ready!\n| Serving ${(await (require('./util/getTotalServerCount')()))} guilds across ${manager.totalShards} shards & ${manager.totalClusters} clusters`)
        }
    })
});

manager.spawn();
const config = require('./config.json');

const { ClusterManager } = require('discord.js-cluster');

const manager = new ClusterManager(`./client.js`, {
    token: config.token
});

const logger = require('./manager/logger')

const logStats = async () => {
    const guildsOnAllShards = await manager.fetchClientValues(`guilds.cache.size`);
    const totalGuilds = guildsOnAllShards.reduce((a,b) => a+b);

    console.log(`| Nyx is ready!\n| Serving ${totalGuilds} guilds across ${manager.totalShards} shards & ${manager.totalClusters} clusters`)
}

manager.on(`clusterCreate`, cluster => {
    console.log(`Launched cluster ${Number(cluster.id)+1}`);

    cluster.on(`message`, opt => {
        try {
            if(logger[opt.name]) {
                logger[opt.name](Number(cluster.id)+1, opt.msg)
            }
        } catch(e) {console.error(e)}
    })

    cluster.on(`ready`, () => {
        console.log(`Cluster ${Number(cluster.id)+1}/${manager.totalClusters} is ready!`);
        if(Number(cluster.id)+1 == manager.totalClusters) logStats()
    })
});

manager.spawn();
const fs = require('fs')

module.exports = () => new Promise(async res => {
    const obj = {
        guildCount: (await manager.fetchClientValues('guilds.cache.size')).reduce((prev, val) => prev + val, 0),
        shardCount: manager.shards.size,
        userCount: (await manager.fetchClientValues('users.cache.size')).reduce((prev, val) => prev + val, 0),
        voiceConnections: (await manager.fetchClientValues('voice.maps.size')).reduce((prev, val) => prev + val, 0),
    }

    const endpoints = fs.readdirSync(`./updateServerCount`);

    console.log(`Pushing statistics to Bot lists!\n- ${Object.entries(obj).map(o => `${o[0]}: ${o[1]}`).join(`\n- `)}`);

    for(list of endpoints) {
        console.log(`Updating "${list.replace(`.js`, ``)}"`)

        const func = require(`./updateServerCount/${list}`);
        
        await func(obj);
    }
})
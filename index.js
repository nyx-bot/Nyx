// Index is going to be the shard manager.

const Discord = require('discord.js');

require('./core/commandHandler/updateDiscordCommandLibrary')().then(() => {
    global.manager = new Discord.ShardingManager(`bot.js`, {
        execArgv: ['--trace-warnings'],
        totalShards: 2,
        respawn: true,
        token: require('./config.json').token
    });
    
    global.manager.on('shardCreate', (shard) => {
        console.log(`| Shard created:\n| ID: ${shard.id}`);
        shard.once(`ready`, () => console.log(`| Shard ${shard.id} ready!`))
    });
    
    global.manager.spawn().then(async shards => {
        console.log(`Shards are ready!`);
        global.manager.broadcastEval(async () => {
            ctx.ready = true;
    
            let activity = -1;
            while(true) {
                const activities = await require(`${require.main.filename.split('/').slice(0, -1).join('/')}/config/activities`).getActive();
                activity = -1
                while(activities[(activity++)+1]) {
                    ctx.bot.user.setPresence({ status: `online`, activities: [activities[activity]] })
                    await new Promise(res => setTimeout(res, 7000))
                }
            }
        })
    }).catch(console.error)
})
module.exports = ({guildsCount, userCount}) => new Promise(async res => {
    superagent
        .post(`https://discordbotlist.com/api/v1/bots/${global.ctx.bot.user.id}/stats`)
        .send({
            guilds: guildsCount,
            users: userCount,
        })
        .set(`Content-Type`, `application/json`)
        .set(`Authorization`, require('../../../config.json').botLists.discordbotlist)
        .then(r => r.body).then(r => {
            if(r.error === false || r.success === true) {
                console.log(`Updated server count!\nProcessed server count: ${r.guildCount}\nProcessed shard count: ${r.shardCount || `N/A`}`)
            } else {
                console.log(`Failed to update server count:`, r)
            }
        })
})
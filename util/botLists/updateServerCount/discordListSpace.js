module.exports = ({guildCount}) => new Promise(async res => {
    superagent
        .post(`https://api.discordlist.space/v2/bots/${global.ctx.bot.user.id}`)
        .send({
            serverCount: guildCount
        })
        .set(`Content-Type`, `application/json`)
        .set(`Authorization`, require('../../../config.json').botLists.discordListSpace)
        .then(r => r.body).then(r => {
            if(r.error === false || r.success === true) {
                console.log(`Updated server count!\nProcessed server count: ${r.guildCount}\nProcessed shard count: ${r.shardCount || `N/A`}`)
            } else {
                console.log(`Failed to update server count:`, r)
            }
        })
})
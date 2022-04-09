module.exports = ({guildCount, serverCount}) => new Promise(async res => {
    superagent
        .post(`https://api.discordextremelist.xyz/v2/bot/${global.ctx.bot.user.id}/stats`)
        .send({
            guildCount: guildCount,
            shardCount: serverCount
        })
        .set(`Content-Type`, `application/json`)
        .set(`Authorization`, require('../../../config.json').botLists.discordExtremeList)
        .then(r => r.body).then(r => {
            if(r.error === false || r.success === true) {
                console.log(`Updated server count!\nProcessed server count: ${r.guildCount}\nProcessed shard count: ${r.shardCount || `N/A`}`)
            } else {
                console.log(`Failed to update server count:`, r)
            }
        })
})
const superagent = require('superagent')

module.exports = ({guildCount, serverCount}) => new Promise(async res => {
    superagent
        .post(`https://discord.boats/api/bot/${global.ctx.bot.user.id}`)
        .send({
            server_count: guildCount
        })
        .set(`Content-Type`, `application/json`)
        .set(`Authorization`, require('../../../config.json').botLists.discordBoats)
        .then(r => r.body).then(r => {
            if(r.error === false || r.success === true) {
                console.log(`Updated server count!\nServer message: ${r.message}`)
            } else {
                console.log(`Failed to update server count:`, r)
            }
        })
})
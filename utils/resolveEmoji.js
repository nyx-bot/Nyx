module.exports = function(guild, emoji) {
     return new Promise((res, rej) => {
          require('superagent').get(`https://discord.com/api/guilds/${guild}/emojis/${emoji}`).set(`Authorization`, `Bot ${require('./config.json').token}`).then(r => r.body).then(r => {
               r.iconURL = `https://cdn.discordapp.com/emojis/${emoji}.png`;
               if(r.animated) {r.iconURL = `https://cdn.discordapp.com/emojis/${emoji}.gif`}
               res(r)
          }).catch(e => rej(e))
     })
}
module.exports = (ctx, id) => new Promise((res, rej) => {
     const superagent = require('superagent');
     superagent.get(`${utils.randomApiLocation(ctx)}lookupSpotify/${id}`).set(`auth`, ctx.musicApi.key).then(r => r.body).then(res).catch(rej)
})
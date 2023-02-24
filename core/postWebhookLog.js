module.exports = async (ctx, webhook, embed) => new Promise(async (res, rej) => {
     const {id, token} = webhook;
     const {icon, name} = webhook.mObj;

     if((embed.title && !embed.title.includes(`undefined`)) && (embed.description && !embed.description.includes(`undefined`)) && (embed.fields && !(JSON.stringify(embed.fields)).includes(`undefined`))) {
          require('superagent')
              .post(`https://discord.com/api/webhooks/${id}/${token}`)
              .send({embeds: [embd], avatar_url: icon, username: name})
              .then(r => {
                   res()
              }).catch(e => {res(); console.d(`ERROR WHEN POSTING A WEBHOOK LOG. .....`); console.de(e)});
     } else {
          console.d(`WOAHHHH ANOTHER DAMN LOGGING MODULE INCLUDES "UNDEFINED" GAHHH`);
          console.d(embed)
     }
})
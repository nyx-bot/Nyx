module.exports = async function (ctx, url, uid, vanity) {
     return new Promise(function (resolve, reject) {
          if(!url) {
               reject(new Error("No URL was provided!"));
          }
          if(!uid) {
               reject(new Error("No UserID was provided!"));
          }
          let bodyObject = {url, uid};
          if(vanity) {
               bodyObject.vanity = encodeURI(vanity.replace(/ /g, "-"));
          }
          ctx.libs.superagent
               .post("https://nyx.bot/api/v1/url/shorten")
               .set(`authorization`, ctx.keys.nyxbotapi)
               .send(bodyObject)
               .then((r) => r.body)
               .then((r) => {
                    return resolve(r);
               })
               .catch((e) => {
                    reject(e);
               });
     });
}
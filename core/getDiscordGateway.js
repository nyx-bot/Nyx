module.exports = ctx => new Promise(async (res, rej) => {
     const data = await (ctx.bot.options.maxShards === "auto" ? ctx.bot.getBotGateway() : ctx.bot.getGateway());
     if(!data.url || (ctx.bot.options.maxShards === "auto" && !data.shards)) rej(new Error("Invalid response from gateway REST call"));
     if(data.url.includes("?")) data.url = data.url.substring(0, data.url.indexOf("?"));
     if(!data.url.endsWith("/")) data.url += "/";
     if(ctx.bot.options.compress) this.gatewayURL += "&compress=zlib-stream";
     ctx.bot.gatewayURL = `${data.url}?v=${require('./node_modules/oceanic.js/dist/lib/Constants').GATEWAY_VERSION}&encoding=${require('erlpack') ? "etf" : "json"}`;
     res(true)
})
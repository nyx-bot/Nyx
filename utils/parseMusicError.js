module.exports = function(ctx, platform, RawError) {
     if(typeof RawError === `undefined`) return msg;

     const err = typeof RawError == `string` ? RawError : require("util").inspect(RawError, { depth: 5 });

     console.d(`Parsing error for ${platform} / ${RawError && RawError.toString ? RawError.toString() : err}`)

     let msg = `${ctx.reportErrTxt}`;

     if(platform == `yt` || platform == `sp`) {
          if(`${err}`.includes(410) || `${err}`.includes(429)) msg = `**YouTube is preventing me from accessing this URL!**\nThis could happen due to a variety of reasons, including geographical restriction, or age restriction -- try to play this song from another platform (like SoundCloud) or try another YouTube link!`
     };

     console.d(`Parsed: ${msg == ctx.reportErrTxt ? `-- none --` : msg}`)

     if(msg === ctx.reportErrTxt) {
          const stack = new Error().stack
          require('fs').writeFile(`./etc/musicError-${Date.now()}.log`, `Platform: ${platform}\n\n${`-`.repeat(49)}\n\nError:\n\n${err}\n\nStack:\n\n${stack}`, () => {
               console.d(`Wrote error log!`)
          })
     } else msg = `\n> ${msg.replace(/\n/g, `\n> `)}`

     return msg;
}
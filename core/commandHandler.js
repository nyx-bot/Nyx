module.exports = (ctx, msg, justReturn) => {
     msg.deferred = false;
     msg.defer = function defer() {
          return new Promise(res => {
               if(msg.deferred) clearInterval(msg.deferred);
               msg.channel.sendTyping()
               msg.deferred = setInterval(() => msg.channel.sendTyping(), 3000);
               res(msg.deferred)
          });
     }
     msg.reply = function reply(...opt) {
          return new Promise(async (res, rej) => {
               if(msg.deferred) clearInterval(msg.deferred)
               ctx.utils.createMessage(ctx, msg, true, ...opt).then(res).catch(rej)
          })
     }
     msg.channel.createMessage = function createMessage(...opt) {
          return new Promise(async (res, rej) => {
               if(msg.deferred) clearInterval(msg.deferred)
               ctx.utils.createMessage(ctx, msg, false, ...opt).then(res).catch(rej)
          })
     }
     if(justReturn) {
          return msg;
     } else if(msg.author.id == ctx.bot.user.id && msg.content) {
          let attachments = [];
          msg.attachments.forEach(a => {
               let str = [];
               if(a.width && a.height) {str.push(`[${a.width}x${a.height}]`)};
               if(a.filename) {str.push(`"${a.filename}"`)};
               str.push(a.url);
               if(str.length !== 0) {attachments.push(str.join(' '))}
          })
          console.debugLog(`[BOT RESPONSE FROM DISCORD WS]${msg.channel.type === 1 ? ` [DM]` : ``}\n${msg.content}${attachments.length !== 0 ? `\n| ${attachments.join('\n| ')}` : ``}`)
     } else core.runCommandThing(ctx, msg)
}
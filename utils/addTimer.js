module.exports = function(ctx, opt) {
     return new Promise(async (res, rej) => {
          if(typeof opt !== 'object') return rej(`Options is not an object!`)
          const timeDue = Number(`${opt.time || opt.timeDue || opt.timer || opt.timerDue}`);
          if(isNaN(timeDue)) return rej(`Time due is not a number!`)
          const useId = opt.useId || opt.guildId || opt.guildID || opt.uid || opt.userId || opt.userID
          const type = opt.type || null
          const run = opt.run || opt.func || opt.toRun;
          const exec = opt.exec || opt.cmd || opt.execute || opt.args
          const meta = opt.meta || null
          const timerID = opt.timerID || `${utils.randomGen(16)}`
          let a = await ctx.seq.models.Timer.build({
               timerID, 
               timeDue, 
               useId, 
               run, 
               exec,
               meta,
               type,
          });
          await a.save().then(async r => {
               if(timeDue - Date.now() <= 70000) {
                    const timer = r.dataValues;
                    args = [];
                    if(timer.exec) {args = timer.exec.split(" ").slice(0)}
                    ctx.core.timeSoonSet(ctx, timer, args)
               }
               res(r)
          }).catch(e => {
               rej(e); 
          });
     })
}
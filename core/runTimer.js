module.exports = async function(ctx) {
     if(ctx.seq) ctx.seq.models[`Timer`].findAll({raw: true}).then(async timers => {
          if(timers.length !== 0) {
               let checked = 0;
               for(num in timers) {
                    await ctx.timeout(250);
                    const timer = timers[num];
                    checked++
                    if(!timer) return;
                    let args = []
                    if(timer.exec) {
                         args = timer.exec.split(" ").slice(0);
                    }
                    const timeDue = timer.timeDue;
                    const timeToDo = timeDue - Date.now();
                    if(timeToDo <= 70000 && !ctx.activeTimers.get(`${timer.run || args[0]}${timeDue}`)) {
                         core.timeSoonSet(ctx, timer, args)
                    }
               }
          }
     })
}
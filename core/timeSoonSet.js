module.exports = async function(ctx, timer, args) {
     const timeDue = timer.timeDue;
     const timeToDo = timeDue - Date.now();
     ctx.activeTimers.set(`${timer.run || args[0]}${timeDue}`, setTimeout(() => {
          ctx.seq.models.Timer.findOne({where: {timerID: timer.timerID}}).then(r => {
               if(r !== null) {
                    console.l(`Timer due! ${timer.run || args[0]}${timeDue}`)
                    ctx.activeTimers.delete(`${timer.run || args[0]}${timeDue}`)
                    if(core.timerFunc[timer.run || args[0]]) {
                         core.timerFunc[timer.run || args[0]](ctx, timer, args)
                    } else {
                         console.l(`┃ there's no function for ${timer.run || args[0]}${timeDue}!`)
                    };
                    if(!timer.run.toLowerCase().includes(`loop`)) {
                         return ctx.seq.models[`Timer`].destroy({ where: { timerID: timer.timerID } });
                    }
               }
          })
     }, timeToDo));
}
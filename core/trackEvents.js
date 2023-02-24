module.exports = async (ctx, emitter, from) => {
     if(emitter.emitterBeforeIFuckingHijackedIt) return;
     emitter.emitterBeforeIFuckingHijackedIt = emitter.emit;
     emitter.removeAllListenersBeforeIFuckingHijackedIt = emitter.removeAllListeners;
     if(!ctx.eventCountWithinASecond) ctx.eventCountWithinASecond = 0;
     if(!ctx.eventCountWithinAMinute) ctx.eventCountWithinAMinute = 0;
     if(!ctx.eventCountWithinAnHour) ctx.eventCountWithinAnHour = 0;
     core.internalEmitter.emit(`ready for ${from}`)
     emitter.emit = (type, ...args) => {
          if(type == `ready`) readyDone = true;
          emitter.emitterBeforeIFuckingHijackedIt(type, ...args);
          if(!core.lastEvents[type]) core.lastEvents[type] = 0;
          core.lastEvents[type]++
          ctx.eventCountWithinASecond++; 
          setTimeout(() => ctx.eventCountWithinASecond--, 1000)
          ctx.eventCountWithinAMinute++; 
          setTimeout(() => ctx.eventCountWithinAMinute--, 60000)
          ctx.eventCountWithinAnHour++; 
          setTimeout(() => ctx.eventCountWithinAnHour--, 3600000)
          Object.keys(core.stats.s).forEach(t => {
               core.stats.s[t]++;
          });

          if(type == `warn`) {
               console.w(`WARNING EVENT:`, ...args)
          }
     };
}
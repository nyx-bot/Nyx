module.exports = (emitter) => {
    if(emitter.emitterBeforeIFuckingHijackedIt) return emitter;
    emitter.emitterBeforeIFuckingHijackedIt = emitter.emit;
    emitter.removeAllListenersBeforeIFuckingHijackedIt = emitter.removeAllListeners;
    if(!global.ctx.eventCount) global.ctx.eventCount = {
        eventCountWithinASecond: 0,
        eventCountWithinAMinute: 0,
        eventCountWithinAnHour: 0,
        eventTypes: {}
    }
    if(!global.ctx.eventCount.eventCountWithinASecond) global.ctx.eventCount.eventCountWithinASecond = 0;
    if(!global.ctx.eventCount.eventCountWithinAMinute) global.ctx.eventCount.eventCountWithinAMinute = 0;
    if(!global.ctx.eventCount.eventCountWithinAnHour) global.ctx.eventCount.eventCountWithinAnHour = 0;
    emitter.emit = (type, ...args) => {
        if(type == `ready`) readyDone = true;
        emitter.emitterBeforeIFuckingHijackedIt(type, ...args);

        if(!global.ctx.eventCount.eventTypes[type]) global.ctx.eventCount.eventTypes[type] = {
            total: 0,
            perSecond: 0,
            perMinute: 0,
            perHour: 0,
        };

        global.ctx.eventCount.eventTypes[type].total++
        global.ctx.eventCount.eventTypes[type].perSecond++
        global.ctx.eventCount.eventTypes[type].perMinute++
        global.ctx.eventCount.eventTypes[type].perHour++

        global.ctx.eventCount.eventCountWithinASecond++; 
        setTimeout(() => global.ctx.eventCount.eventCountWithinASecond-- && global.ctx.eventCount.eventTypes[type].perSecond--, 1000)
        global.ctx.eventCount.eventCountWithinAMinute++; 
        setTimeout(() => global.ctx.eventCount.eventCountWithinAMinute-- && global.ctx.eventCount.eventTypes[type].perMinute--, 60000)
        global.ctx.eventCount.eventCountWithinAnHour++; 
        setTimeout(() => global.ctx.eventCount.eventCountWithinAnHour-- && global.ctx.eventCount.eventTypes[type].perHour--, 3600000)

        if(type == `warn`) {
            console.w(`WARNING EVENT:`, ...args)
        }
    }; return emitter;
}
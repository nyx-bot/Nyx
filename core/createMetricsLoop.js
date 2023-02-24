module.exports = async (ctx) => {
    let io = null;
    try {
        io = require(`@pm2/io`);
    } catch(e) {
        console.warn(`PM2 io is not present on this system; skipping...`);
    }

    if(!io) return;

    console.d(`PM2 io found!`);

    let pm2Metrics = {};

    while(true) {
        if(process.send && typeof process.send == `function`) {
            process.send({
                type: `pm2Metrics`,
                data: ctx.core.metrics(ctx)
            })
        } else if(ctx.core.metrics) for (o of Object.entries(ctx.core.metrics(ctx))) {
            if(process.send && typeof process.send == `function`) {
                if(!pm2Metrics[o[0]]) pm2Metrics[o[0]] = o[1]
            } else {
                if(!pm2Metrics[o[0]]) pm2Metrics[o[0]] = io.metric({
                    type: 'histogram',
                    measurement: 'mean',
                    name: o[0]
                });
    
                pm2Metrics[o[0]].set(o[1])
            }
        }

        await new Promise(r => setTimeout(r, 1000));
    }
}
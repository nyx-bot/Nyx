module.exports = {
    "name": "benchmark",
    "desc": "benchmark ur Momm!!!!",
    func: async function(ctx, msg, args) {
        if(ctx.elevated.find(id => id == msg.author.id)) {
            let done = 0; let time = Date.now(); let timeToRun = 5000
            if(!isNaN(args[0])) {timeToRun = Number(args[0])}
            const timeAAA = await ctx.utils.timeConvert(timeToRun)
            const m = await msg.reply(`${ctx.processing} Benchmarking for ${timeAAA}...`)
            function a() {
                done++
                ctx.seq.models[`Server`].findAll({raw: true}).then(r => {
                    if(Date.now() - time > 5000) {
                        return m.edit(`${ctx.pass} ${done} queries to the DB was made within ${timeAAA}`)
                    } else {
                        a()
                    }
                })
            };
            a()
        }
    }
}
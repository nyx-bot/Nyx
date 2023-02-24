module.exports = {
    "name": "delreminder",
    "desc": "Delete a specific reminder!",
    "args": [
        {
            "opt": false,
            "arg": "position of reminder to delete"
        }
    ],
    "aliases": [
        "delremind",
        "rmremind",
        "deleteremind",
        "clearreminder"
    ],
    func: async function(ctx, msg, args) {
        if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
        let ids = []
        ids = await new Promise(async(resp, rej) => {
            let res = await ctx.seq.models[`Timer`].findAll({where: {type: `reminder`, useId: msg.author.id}});
            let count = 0; let array = [];
            for(rem in res) {
                count++;
                reminder = res[rem].dataValues;
                array.push(reminder.timerID);
            };
            resp(array)
        });
        if(Math.round(args[0]) > ids.length || 1 > Math.round(args[0])) return msg.reply(`${ctx.fail} yyou have ${ids.length} reminders total...`);
        let num = Math.round(args[0]) - 1;
        const res = await ctx.seq.models[`Timer`].findOne({where: {timerID: ids[num]}, raw: true});
        if(res) {
            ctx.cache[`confirm${msg.author.id}`] = {
                guild: msg.channel.guild.id,
                timerID: ids[num],
                run: async (ctxN, msgN, argsN) => {
                    const timerID = ctxN.cache[`confirm${msgN.author.id}`].timerID
                    const res = await ctxN.seq.models[`Timer`].findOne({where: {timerID}, raw: true});
                    ctxN.seq.models[`Timer`].destroy({where: {timerID}}).then(r => {
                        return msgN.channel.createMessage(`${ctx.pass} Successfully deleted the reminder!\n> ${res.meta.replace(/\n/g, '\n> ')}`)
                    }).catch(e => msg.reply(`${ctx.fail} ${ctx.errMsg()}`))
                }
            };
            
            let time = (res.timeDue - Date.now()); if(time < 1000) {time = 1000}
            const timeLeft = await ctx.utils.timeConvert(time, true);
    
            const footer = `${res.run == `remindLoop` ? `jjust, ,,to be clear,, this doesn't cancel the reminder for one time,,it will completely get rid of it,,,like ..gone ...completely` : `you,,,uhm,,,you can't get it back at all if you actually do delete it,, unless,yknow ,,you re-add it,`}`
    
            const aeoe = await msg.reply(`aare you sure you want to delete this ,${res.run == `remindLoop` ? `looped ` : ``}reminder?\n> ${res.meta.replace(/\n/g, `\n> `)}\nthis will time out in 30 seconds , confirm this action using \`${msg.prefix}confirm\`!\n\n${footer}`);
    
            setTimeout(async () => {
                await aeoe.edit(`~~aare you sure you want to delete this ,${res.run == `remindLoop` ? `looped ` : ``}reminder?~~ timed out,,\n> ${res.meta.replace(/\n/g, `\n> `)}\nthis will time out in 30 seconds , confirm this action using \`${msg.prefix}confirm\`!\n\n${footer}`)
                delete ctx.cache[`confirm${msg.author.id}`]
            }, 30000);
        } else {
            return msg.reply(`${ctx.fail} I can't find that reminder!`)
        }
    }
}
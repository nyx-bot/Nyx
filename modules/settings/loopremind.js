module.exports = {
    "name": "loopremind",
    "desc": "Set a reminder for yourself that repeats every 24 hours!",
    "args": [
        {
            "opt": false,
            "arg": "time until the reminder"
        },
        {
            "opt": false,
            "arg": "reminder message"
        }
    ],
    "aliases": [
        "remindloop",
        "loopremindme",
        "repeatremind"
    ],
    func: async function(ctx, msg, args) {
        if(!args[0]) {return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)} else {
            const obj = await ctx.utils.getTimeFromArg(args);
            const time = obj.time;
            args = obj.args;
            if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
            if(args.join(' ').length > 250) {return msg.reply(`${ctx.fail} The message cannot be longer than 250 characters!`)}
            let res = await ctx.seq.models[`Timer`].findAll({where: {type: `reminder`}, raw: true});
            if(res.length >= 10) return msg.reply(`${ctx.fail} You cannot have more than 10 reminders tasked!`)
            await ctx.utils.addTimer(ctx, {
                timeDue: Date.now()+time,
                useId: msg.author.id,
                run: `remindLoop`,
                type: `reminder`,
                meta: `${args.join(' ')}`
            }).then(async timer => {
                const timeString = await ctx.utils.timeConvert(time)
                return msg.reply(`${ctx.pass} Timer successfully set for ${timeString} from now, and repeats every 24 hours!\n> ${timer.dataValues.meta.replace(/\n/g, '\n> ')}`)
            })
        }
    }
}
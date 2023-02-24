module.exports = {
    "name": "reminders",
    "desc": "Show a list of currently active timers!",
    "args": [],
    "aliases": [
        "reminderlist",
        "myreminders",
        "reminds"
    ],
    func: async function(ctx, msg, args) {
        let res = await ctx.seq.models[`Timer`].findAll({where: {type: `reminder`, useId: msg.author.id}, raw: true});
        let toplength = 0;
        function a() {
            return new Promise(async (resp, rej) => {
                let count = 0; let array = [];
                for(rem in res) {
                    count++;
                    reminder = res[rem];
                    if(!ctx.cache[`remindList${msg.channel.guild.id}-${msg.author.id}`]) {
                        ctx.cache[`remindList${msg.channel.guild.id}-${msg.author.id}`] = {
                            ids: []
                        };
                        setTimeout(() => {
                            try{
                                delete ctx.cache[`remindList${msg.channel.guild.id}-${msg.author.id}`]
                            }catch(e){}
                        }, 20000)
                    };
                    ctx.cache[`remindList${msg.channel.guild.id}-${msg.author.id}`].ids.push(reminder.timerID)
                    const string = reminder.meta.substring(0, 75);
                    if(reminder.meta !== string) string = `${string}...`;
                    let time = (reminder.timeDue - Date.now()); if(time < 1000) {time = 1000}
                    await ctx.utils.timeConvert(time, true).then(a => {
                        let pin = ``; 
                        pin = pin + ` (${a})`
                        if(reminder.run == `remindLoop`) {pin = pin + ` [LOOP]`};
                        let built = `> [${count}]${pin} ${string}`
                        array.push(built)
                        if(built.length > toplength) {toplength = built.length}
                    })
                };
                return resp(array)
            })
        }
        const array = await a();
        if(toplength > 60) toplength = 60;
        const divide = `=`.repeat(toplength)
        if(array.length === 0) {return msg.reply(`${ctx.fail} You have no reminders set!`)} else {
            const embed = {
                title: `Reminders`,
                description: `\`\`\`js\n\n${array.join(`\n${divide}\n`)}\n\`\`\`\n${msg.prefix}delreminder <num>`,
                color: ctx.utils.colors('random'),
            }
            return msg.reply({embed})
        }
    }
}
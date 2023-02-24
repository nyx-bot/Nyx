module.exports = {
    "name": "update",
    "desc": "update ur Momm!!!!",
    func: async (ctx, msg, args) => {
        if(ctx.elevated.find(id => id == msg.author.id)) {
            let functions = {}
            const s = new (require('events').EventEmitter)();
            let currentStep = 0;
            let latestOutput = [];
            let int;
            let m;
            s.on('update', async (fail) => {
                currentStep++;
                const content = `${ctx.processing} Updating Nyx... (${currentStep}/${Object.keys(functions).length})`;
                let tl = 50;
                let func = `[${Object.keys(functions)[currentStep-1]}] `;
                func = func + `${`-`.repeat(tl-func.length)}`
                latestOutput.unshift(func.toUpperCase())
                let f = ``; if(fail) {f = `Step ${currentStep} failed`}
                if(!int) {
                    int = setInterval(() => {
                        let embed = {
                            title: `Output`,
                            description: `\`\`\`diff\n${latestOutput.slice(0).reverse().join('\n') || `[no log]`}\`\`\``,
                            color: ctx.utils.colors('purple'),
                        };
                        if(latestOutput[0].startsWith(`- `)) {embed.color = ctx.utils.colors('red_light')}
                        m.edit({content: m.content, embed})
                    }, 2500)
                }
                if(!m) {m = await msg.reply(content);} else m = await m.edit(content);
                if(functions[Object.keys(functions)[currentStep-1]]) {
                    functions[Object.keys(functions)[currentStep-1]]()
                } else {
                    clearInterval(int);
                    if(args.find(a => a.toLowerCase() == `--update`)) {
                        m.edit({content: `${ctx.pass} Successfully updated Nyx!`, embeds: [{title: `Output`}]});
                        return ctx.core.exit()
                    } else {
                        return m.edit({content: `${ctx.pass} Successfully updated Nyx!`, embeds: [{title: `Output`}]})
                    }
                }
            });
            let exec = async (ls) => {
                ls.stdout.on('data', (data) => {
                    if(`${data}`.endsWith(`\n`)) {data = `${data}`.substring(0, `${data}`.length-1)};
                    console.l(`┃ UPDATE: ${data}`);
                    data = data.split('\n')[0];
                    let str = data;
                    if(str.length > 45) {str = `${data.substring(0, 45)}...`}
                    latestOutput.unshift(`+ ${str}`);
                    if(latestOutput.length > 5) {latestOutput.length = 5}
                });
    
                ls.stderr.on('data', (data) => {
                    if(`${data}`.endsWith(`\n`)) {data = `${data}`.substring(0, `${data}`.length-1)}
                    console.w(`┃ UPDATE: ${data}`);
                    data = data.split('\n')[0];
                    let str = data;
                    if(str.length > 45) {str = `${data.substring(0, 45)}...`}
                    latestOutput.unshift(`- ${str}`);
                    if(latestOutput.length > 5) {latestOutput.length = 5}
                });
    
                ls.on('exit', (code) => {
                    s.emit('update')
                });
            }
            functions.git = async () => {
                exec(require('child_process').exec(`git pull`))
            }; 
            functions.yarn = async () => {
                exec(require('child_process').exec(`yarn upgrade --latest`))
            };
            s.emit('update')
        }
    }
}
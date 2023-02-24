module.exports = {
    "name": "pull",
    "desc": "pull ur Momm!!!!",
    func: function(ctx, msg, args) {
        if(ctx.elevated.includes(msg.author.id)) {
            require('child_process').exec(`git status`, (e, out, err) => {
                if(e) {
                    return msg.reply(`${ctx.fail} ${e}`)
                } else {
                    let output = out.toString();
                    let a = `${output.replace('On branch ', '')}`, b = a.split('\n'), branch = b[0]
                    msg.reply(`${ctx.processing} Pulling from branch \`${branch}\``).then(m => {
                        require('child_process').exec(`git pull`, async (e, out, err) => {
                            if(e) {
                                return m.edit(`${ctx.fail} ${e}`)
                            } else if(out.toString().includes(`Already up to date`)) {
                                return m.edit(`${ctx.pass} Already up to date!`)
                            } else {
                                let op = out.toString();
                                const embed = {
                                    description: `\`\`\`bash\n${op}\`\`\``
                                };
                                return m.edit({content: `${ctx.pass} Success!`, embed})
                            }
                        })
                    })
                }
            })
        }
    }
}
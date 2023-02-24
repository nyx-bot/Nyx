module.exports = {
    "name": "eval",
    "desc": "evaluate ur Momm!!!!",
    func: async function (ctx, msg, args) {
        if(ctx.elevated.find(id => id == msg.author.id)) {
            let errored = false;
            let out;
            let isURL = false;
    
            if(isURL) {
                let toRun = await ctx.libs.superagent.get(args.join(' ')).then((x) => x.text);
    
                try {
                    out = eval(toRun);
                    if(out && out.then) out = await out;
                } catch (e) {
                    out = e.message ? e.message : e;
                    errored = true;
                }
            } else {
                let music = ctx.music[msg.channel.guild.id], np, queue
                if(music) {
                    np = music.queue[0];
                    queue = music.queue
                }
                try {
                    out = eval(args.join(' '));
                    if(out && out.then) out = await out;
                } catch (e) {
                    out = `${e}`
                    errored = true;
                }
            }
    
            out = (typeof out == "string" ? `${out}` : require("util").inspect(out, { depth: 0 })).replace(
                new RegExp(ctx.config.token.replace(/\./g, "\\."), "g"), "No Key 4 U Dipshit"
            );
    
            if(errored) {
                msg.reply(
                    `${ctx.fail} Output (errored):\n\`\`\`js\n` + out + "\n```"
                );
            } else {
                if(out.toString().length > 1980) {
                    let output = out.toString();
                    ctx.utils.makeHaste(
                        ctx,
                        msg,
                        output,
                        `${ctx.pass} Output too long to send in a message: `
                    );
                } else {
                    msg.reply(`${ctx.pass} Output:\n\`\`\`js\n` + out + "\n```");
                }
            }
        } else return;
    }
}
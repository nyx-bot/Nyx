module.exports = {
    "name": "exec",
    "desc": "execute ur Momm!!!!",
    func: function (ctx, msg, args) {
        if(ctx.elevated.includes(msg.author.id)) {
            args = args.join(' ').replace(/rm \-rf/g, "echo");
            require("child_process").exec(args, (e, out, err) => {
                if(e) {
                    msg.reply("Error\n```" + e + "```");
                } else {
                    if(out.toString().length > 1980) {
                        let output = out.toString();
                        ctx.utils.makeHaste(
                            ctx,
                            msg,
                            output,
                            ctx.pass + " Output too long to send in a message: "
                        );
                    } else {
                        msg.reply(
                            ctx.pass + " Output:\n```bash\n" + out + "\n```"
                        );
                    }
                }
            });
        }
    }
}
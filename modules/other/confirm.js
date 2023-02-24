module.exports = {
    "name": "confirm",
    "desc": "Confirm usage of a command, or other.",
    "interactionObject": {},
    func: async function confirm(ctx, msg, args) {
        if(ctx.cache[`confirm${msg.author.id}`]) {
            if(ctx.cache[`confirm${msg.author.id}`].guild) {
                if(
                    ctx.cache[`confirm${msg.author.id}`].guild ==
                    msg.channel.guild.id
                ) {
                    ctx.cache[`confirm${msg.author.id}`].run(ctx, msg, args);
                } else {
                    return msg.reply(
                        `${ctx.fail} You have nothing to confirm!`
                    );
                }
            } else {
                ctx.cache[`confirm${msg.author.id}`].run(ctx, msg, args);
            }
        } else {
            return msg.reply(
                `${ctx.fail} You have nothing to confirm!`
            );
        }
    }
}
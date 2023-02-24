module.exports = {
    "name": "reload",
    "desc": "restart ur Momm!!!!",
    func: async function(ctx, msg, args) {
        if(ctx.elevated.find(id => id == msg.author.id)) {
            const m = await msg.reply(`${ctx.processing} Restarting...`);
            require('fs').writeFileSync(`./restart.json`, JSON.stringify({
                message: m.id,
                channel: m.channel.id,
                guild: msg.channel.guild.id
            }));
            return ctx.core.exit(ctx)
        }
    }
}
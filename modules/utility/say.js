module.exports = {
    "name": "say",
    "desc": "Have Nyx say something!",
    "args": [
        {
            "opt": false,
            "arg": "message for nyx to repeat"
        }
    ],
    "aliases": [
        "speak"
    ],
    func: async function(ctx, msg, args) {
        if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
        const raw = args.join(" ")
        const sayMessage = raw.replace(/@/g, "@\u200b")
    
        msg.reply(sayMessage)
    }
}
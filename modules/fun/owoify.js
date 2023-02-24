module.exports = {
    "name": "owoify",
    "desc": "OwO-ifies what you say!",
    "args": [
        {
            "opt": false,
            "arg": "message to translate"
        }
    ],
    "example": "`;uwu this command is really cursed and only exists because syl was very tired one night and had a really dumb idea.`\n\n- this command is weawwy cuwsed and onwy exists because syw was vewy tiwed onye nyight and had a weawwy dumb idea.",
    "aliases": [
        "owo",
        "uwuify",
        "uwu"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "message",
                "description": "The message to translate",
                "required": true
            }
        ]
    },
    func: async (ctx, msg, args) => msg.reply(args.length !== 0 ? ctx.utils.owoify(args) : `${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
}
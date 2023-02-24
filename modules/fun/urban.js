module.exports = {
    "name": "urban",
    "desc": "Search a term on the worst dictionary\n\n\n:)",
    "args": [
        {
            "opt": false,
            "arg": "term to look up"
        }
    ],
    "example": "`;urban anatidaephobia`\n\n- \"**The fear** that **somewhere**, somehow, **a duck** is watching you.\"",
    "aliases": [
        "ud",
        "urbandictionary"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "term",
                "description": "The term to search the dictionary with",
                "required": true
            }
        ]
    },
    func: async function (ctx, msg, args) {
        if(!args[0]) return msg.reply(`${ctx.fail} Give me something to define!`);
        await msg.defer()
        let base = `http://api.urbandictionary.com/v0/define?term=`
        let termA = encodeURI(args.slice(0).join("%20"))
        ctx.libs.superagent
            .get(base + termA)
            .then(r => {
                if(!r.body.list[0]) return msg.reply(`${ctx.fail} There is no definition of **${unescape(termA).replace(/%20/g, ' ').replace(/\*/g, '\\*')}**!`)
                let term = r.body.list[0]
                var trimmedfafa = false;
                var length = 512;var trimmed = (`${term.definition}`).substring(0, length);var definition;if(trimmed !== term.definition) {trimmedfafa = true; definition = `${trimmed}`} else {definition = term.definition}
                if(trimmedfafa) {definition = `${definition}... <bg>Continue Reading<end>(${term.permalink})`}
                var trimmedfafa = false;
                var trimmedB = (`${term.example}`).substring(0, length);var example;if(trimmedB !== term.example) {trimmedfafa = true; example = `${trimmedB}`} else {example = trimmed}
                if(trimmedfafa) {example = `${example}... <bg>Continue Reading<end>(${term.permalink})`}
                let ae = {
                    title: `Urban Dictionary: **${term.word}**`,
                    color: 1134312,
                    description: `\n> ${(definition).replace(/\[/g, '**').replace(/\]/g, '**').replace(/<br>/g, '\n').replace(/\n/g, '> ').replace(/<bg>/g, '[').replace(/<end>/g, ']')}\n\n**Example(s)**\n${(trimmedB).replace(/\[/g, '**').replace(/\]/g, '**')}\n\n[__**View on Urban Dictionary**__](${term.permalink})`,
                    footer: {text: `👍 ${term.thumbs_up} 👎 ${term.thumbs_down}   |   Author: ${term.author}`}
                }
                return msg.reply({embeds: [ae]})
            })
            .catch(err => {
                if(err.status === 400) {return msg.reply(`${ctx.fail} ${ctx.errMsg()}`)} else {
                    return msg.reply(`${ctx.fail} ${ctx.errMsg()}`)
                }
            });
    }
}
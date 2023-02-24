module.exports = {
    "name": "pronouns",
    "desc": "Set your own pronouns for the bot's usage!",
    "args": [
        {
            "opt": false,
            "arg": "[pronouns]"
        }
    ],
    "aliases": [
        "setpronouns"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "subjective",
                "description": "*She* has, *they* did, *he* is",
                "required": true
            },
            {
                "type": 3,
                "name": "posessive",
                "description": "*Her* pronouns, *his* chocolate, *their* cat",
                "required": true
            },
            {
                "type": 3,
                "name": "objective",
                "description": "Said to *him*, did with *them*, played with *it*",
                "required": true
            },
            {
                "type": 3,
                "name": "referred",
                "description": "They *are* setting their pronouns, she *is* listening to music",
                "required": true
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let userSetting = await ctx.utils.lookupUserOrCreate(ctx, msg.author.id);
        let pr = await ctx.utils.pronouns(ctx, msg.author.id);
        const pr2 = await ctx.utils.pronouns(ctx, ctx.bot.user.id);
        const usage = `${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\`\nCurrently, I recognize you by "${pr.a}/${pr.c}"\n\n**Note:** the pronoun order will fit the following sentence:\n> This is ${pr.name}; {a} {d} setting {b} pronouns for me to refer to {c} as! {a} {d} my friend!\n\nFor example, my pronouns are "they/them!" so I would say \`${msg.prefix}${this.name} they their them are\` if I were to refer to myself in 3rd person, which would make the sentence...\n> This is ${pr2.name}; ${pr2.a} ${pr2.d} setting ${pr2.b} pronouns for me to refer to ${pr2.c} as! ${pr2.a} ${pr2.d} my friend!`
        if(!args[0]) {return msg.reply(usage)} else {args[0] = args[0].toLowerCase();
            if(args[0] && (args[0].split(`/`).length === 4 || args.length === 4)) {
                const pronouns = args.length === 4 ? args.map(a => a.replace(/ /g, ``)) : args[0].split(`/`).map(a => a.replace(/ /g, ``));
                const m = await msg.reply(`${ctx.pass} Okay! Just to make sure that this was done right, let's preview that sentence one more time, referring to you!\n\n> This is ${pr.name}; ${pronouns[0]} ${pronouns[3]} setting ${pronouns[1]} pronouns for me to refer to ${pronouns[2]} as! ${pronouns[0]} ${pronouns[3]} my friend!\n\nIf everything looks good, please make sure to let me know by using \`${msg.prefix}confirm\`!`)
                ctx.cache[`confirm${msg.author.id}`] = {
                    guild: msg.channel.guild.id,
                    run: async (ctxN, msgN, argsN) => {
                        await userSetting.update({pronouns: pronouns.join(` `)}, {
                            where: {
                                id: msg.author.id
                            }
                        });
                        userSetting.save().then(res => res.toJSON()).then(async res => {
                            pr = await ctx.utils.pronouns(ctx, msg.author.id);
                            clearTimeout(ctx.cache[`confirm${msg.author.id}`].timeout)
                            return msgN.channel.createMessage(`${ctx.pass} Done, I'll refer to you by ${pr.a}/${pr.c} from now on! (I sincerely apologize if I've misgendered you...)`);
                        })
                    }, timeout: setTimeout(() => {
                        m.edit(`~~${m.content}~~\n\nI'm not sure if this was right! Please do the process again so I can stop misgendering you.. :(`);
                        delete ctx.cache[`confirm${msg.author.id}`]
                    }, 45000)
                };
            } else return msg.reply(usage)
        }
    }
}
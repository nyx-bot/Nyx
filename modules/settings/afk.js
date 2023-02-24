module.exports = {
    "name": "afk",
    "desc": "Going AFK for a bit? Let me know, and I'll tell whoever pings you that you're away!",
    "args": [
        {
            "opt": true,
            "arg": "message to show when mentioned"
        }
    ],
    "aliases": [
        "setafk"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "message",
                "description": "The message for me to reply when you're mentioned",
                "required": false
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let userSetting = await ctx.utils.afk.get(ctx, msg.author.id); let reason; if(args[0]) {reason = args.join(' ')} else {reason = `N/A`}
        if(!args[0] && userSetting !== null) {
            const rm = await ctx.utils.afk.remove(ctx, msg.author.id);
            if(rm) {
                let resp = ['hi again!!! i removed your AFK status!', 'welcome back!!! your AFK status has `v a n i s h e d`', 'hihi!! i removed ur AFK!']
                return msg.reply(`${ctx.pass} ${resp[Math.floor((Math.random() * resp.length))]}`)
            }
        } else {
            const m = await ctx.utils.afk.set(ctx, msg.author.id, reason);
            let resp = ['ddon\'t be too long...', 'i\'ll miss you!!', 'ssee you soon!']
            return msg.reply(`${ctx.pass} ${resp[Math.floor((Math.random() * resp.length))]}\n> ${m.replace(/\n/g, '\n> ')}!\n\n**Keep in mind** that you can remove your AFK status by using \`${msg.prefix}afk\` by itself!`)
        }
    }
}
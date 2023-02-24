module.exports = {
    "name": "howgayis",
    "desc": "see how gay someone is (trustworthy 100).",
    "args": [
        {
            "opt": false,
            "arg": "@person"
        }
    ],
    "aliases": [
        "gayrate"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 6,
                "name": "person",
                "description": "The person to measure.",
                "required": true
            }
        ]
    },
    func: async function(ctx, msg, args) {
        const gaymeter = ["5","5","5","10","10","15","15","20","20","20","20","25","25","35","35","35","35","35","35","35","35","35","40","45","50","55","60","65","69","70","75","80","85","90","95","100"]
        let userpinged = msg.mentions.members[0]
        if(!userpinged) return msg.reply(`who are you trying to rate?`)
        if(userpinged.bot && userpinged.id !== ctx.bot.user.id) return msg.reply(`let me teach you a lesson about bots, they simply cannot.`);
        let person = await ctx.utils.pronouns(ctx, userpinged);
        return msg.reply(`**${person.name}** is ${gaymeter[Math.floor((Math.random() * gaymeter.length))]}% gay`)
    }
}
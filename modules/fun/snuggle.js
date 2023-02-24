module.exports = {
    "name": "snuggle",
    "desc": "snuggle up with someone,, happy times,,!",
    "args": [
        {
            "opt": false,
            "arg": "@person"
        }
    ],
    "interactionObject": {
        "options": [
            {
                "type": 6,
                "name": "person",
                "description": "The person to snuggle up with!",
                "required": true
            }
        ]
    },
    func: async function(ctx, msg, args) {
        var plsdontkillme = ctx.msgs[this.name].nyx;
        let ifnyxpinged = eval(`\`${plsdontkillme[Math.floor((Math.random() * plsdontkillme.length))]}\``)
        let authorpronoun = await ctx.utils.pronouns(ctx, msg.author);
        var errresp = ctx.msgs[this.name].self;
        var ifauthorpinged = eval(`\`${errresp[Math.floor((Math.random() * errresp.length))]}\``)
        if((args[0] == 'myself') || (args[0] == 'me')) return msg.reply(ifauthorpinged);
        let usr = await ctx.utils.resolveGuildMember(msg.channel.guild, (msg.mentions && msg.mentions.members.length > 0 ? msg.mentions.members[0].id : args[0]))
        let person = msg.channel.guild.members.find(member => member.id == usr);
        if(!usr) return msg.reply("who do u wanna snuggle?")
        if(`${person.id}` == `${msg.author.id}`) return msg.reply(ifauthorpinged);
        if(`${person.id}` == `${ctx.bot.user.id}`) return msg.reply(ifnyxpinged);
        let usrpronoun = await ctx.utils.pronouns(ctx, person);
        hugger = authorpronoun.name; hugged = usrpronoun.name;
        var responses = ctx.msgs[this.name].responses;
        return msg.reply(eval(`\`${responses[Math.floor((Math.random() * responses.length))]}\``))
    }
}
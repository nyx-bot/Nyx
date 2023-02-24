module.exports = {
    "name": "avatar",
    "desc": "Get someone's profile picture easily",
    "args": [
        {
            "opt": true,
            "arg": "@user",
            "longarg": "@user to get the avatar of"
        }
    ],
    "aliases": [
        "av"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 6,
                "name": "user",
                "description": "The member you want to get the avatar from",
                "required": false
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let usr = (args[0] || msg.author.id)
        let resolve = await ctx.utils.resolveGuildMember(msg.channel.guild, usr)
        person = await msg.channel.guild.members.find(member => member.id == resolve);
        if(!person) return msg.reply(`${ctx.fail} Please mention a valid user!`);
        msg.reply({embeds: [{
            title: `${person.username}'s avatar:`,
            description: `**[[128px]](${person.avatarURL.replace('?size=2048', `?size=128`)}) / [[256px]](${person.avatarURL.replace('?size=2048', `?size=256`)}) / [[512px]](${person.avatarURL.replace('?size=2048', `?size=512`)}) / [[1024px]](${person.avatarURL.replace('?size=2048', `?size=1024`)}) / [[2048px]](${person.avatarURL})**`,
            image: {url: `${person.avatarURL}`},
            color: ctx.utils.colors(`random`),
        }]});
    }
}
module.exports = {
    "name": "kick",
    "desc": "Kick a specific user.",
    "args": [
        {
            "opt": false,
            "arg": "@person"
        },
        {
            "opt": true,
            "arg": "reason of the kick"
        }
    ],
    "permission": 1,
    "aliases": [
        "k",
        "boot"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 6,
                "name": "member",
                "description": "The member in question.",
                "required": true
            },
            {
                "type": 3,
                "name": "reason",
                "description": "The reason as to why this member is being disciplined.",
                "required": false
            }
        ]
    },
    func: async function(ctx, msg, args) {
        if(!args[0]) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
        let usrID = await ctx.utils.resolveGuildMember(msg.channel.guild, (msg.mentions && msg.mentions.members.length > 0 ? msg.mentions.members[0].id : args[0]), 'strict');
        if(!usrID) return msg.reply(`${ctx.fail} I couldn't find that member!`);
        let person = msg.channel.guild.members.find(member => member.id == usrID);
        let reason = typeof msg.data == `object` && msg.data.options && msg.data.options.find(o => o.name == `reason`) ? msg.data.options.find(o => o.name == `reason`).value : (args.slice(1).join(" ") || "N/A");
        if(reason.length > 250) {return msg.reply(`${ctx.fail} Reasoning can only be **at max** 250 characters!`)};
        const m = await msg.reply(`${ctx.processing} Kicking **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**...`);
        const modHighest = await ctx.utils.highestRoleNumber(msg.channel.guild, msg.member.roles);
        const memHighest = await ctx.utils.highestRoleNumber(msg.channel.guild, person.roles);
        const botHighest = await ctx.utils.highestRoleNumber(msg.channel.guild, msg.channel.guild.me.roles);
        if(memHighest >= modHighest) return m.edit(`${ctx.fail} Failed to kick **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nYou can't kick this user, as they have the same (or a higher) role!`);
        if(memHighest >= botHighest) return m.edit(`${ctx.fail} Failed to kick **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nMy role is too low to do this!`); 
        let failed = false;
        try {
            await (await person.user.createDM()).createMessage(`**${ctx.utils.escapeDiscordsFuckingEditing(msg.author.username)}** has kicked you from **${ctx.utils.escapeDiscordsFuckingEditing(msg.channel.guild.name)}**!\n> ${reason.replace(/\n/g, '\n> ')}`).catch(e => {failed = true;});
        } catch(e) {failed = true}
        let ext = ``; if(failed) {ext = `\nI was unable to message them!`}
        async function complete() {
            m.edit(`${ctx.pass} **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}** has been kicked!${ext}\n ${reason.replace(/\n/g, '\n> ')}`);
            const log = await ctx.utils.createLog(ctx, person.id, msg.channel.guild.id, msg.author.id, reason, `kick`);
            ctx.bot.emit(`memberKicked`, msg.member, person, reason)
        }
        person.kick(reason).then(async a => {
            complete()
        }).catch(err => {
            var error = new Error(err);
            if(error.message.includes('Missing Permissions')) {
                return m.edit(`${ctx.fail} Failed to kick **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nI don\'t have permission!`)
            } else if(error.message.includes("Cannot read property")) {
                return m.edit(`${ctx.fail} Failed to kick **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**\nUnknown Member`)
            } else complete()
        })
    }
}
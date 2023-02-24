module.exports = {
    "name": "modlogs",
    "desc": "Check the moderation logs performed on a specific user!.",
    "args": [
        {
            "opt": false,
            "arg": "@person"
        },
        {
            "opt": true,
            "arg": "page number"
        }
    ],
    "permission": 1,
    "aliases": [
        "ml"
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
                "name": "page",
                "description": "The page number to view.",
                "required": false
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let usrID = await ctx.utils.resolveGuildMember(msg.channel.guild, (msg.mentions && msg.mentions.members.length > 0 ? msg.mentions.members[0].id : args[0]), 'strict');
        let person = msg.channel.guild.members.find(member => member.id == usrID);
        if(!usrID) {
            await ctx.utils.resolveUser(args[0]).then(r => {
                person = r
                args.shift();
            }).catch(e => {
                person = msg.member
            })
            usrID = msg.author.id;
        } else {args.shift();}
        const warnlogs = await ctx.utils.getLogs(ctx, person.id, msg.channel.guild.id, null, true);
        if(warnlogs.length === 0) {return msg.reply(`${ctx.fail} There are no modlogs on **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}** yet!`)} else {
            let pages = Math.floor((((warnlogs.length-1)/ 5))+1)
            let page = 1
            if(args[0] && !isNaN(args[0])) {page = Math.round(args[0])}; 
            if(page > pages) {return msg.reply(`${ctx.fail} There are only **${pages}** pages available for **${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}**!`)} else {
                let done = 0;
                let start = (page*5)-5;
                let txt;
                while(done !== 5 && (done+start) !== warnlogs.length) {
                    let r = warnlogs[start+done];
                    done++; let date; let pin = ``; if(r.deleted) {pin = ` **\`[DEL]\`**`}; if(r.duration) {
                        const timeAAA = await ctx.utils.timeConvert(r.duration, true)
                        pin = ` **\`[${timeAAA}]\`**`
                    }
                    if(ctx.libs.moment(new Date(r.createdAt)).format("YYYY") == ctx.libs.moment((new Date())).format("YYYY")) {date = ctx.libs.moment(new Date(r.createdAt)).format("MMM Do")} else {date = ctx.libs.moment(new Date(r.createdAt)).format("MMM Do, YYYY")};
                    if(!txt) {
                        txt = `> **\`[${(r.logType).toUpperCase()}]\`**${pin} ${date} // Moderator: <@${r.modID || `--`}>\n> ${r.desc.replace(/\n/, '\n> ')}`
                    } else {
                        txt = txt + `\n\n> **\`[${(r.logType).toUpperCase()}]\`**${pin} ${date} // Moderator: <@${r.modID || `--`}>\n> ${r.desc.replace(/\n/, '\n> ')}`
                    }
                }
                let embed = {
                    color: ctx.utils.colors('random'),
                    title: `${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}'s moderation logs`,
                    description: txt,
                    footer: {text: `Showing ${done} results  //  Page ${page}/${pages}`}
                };
                return msg.reply({content: `**${ctx.utils.escapeDiscordsFuckingEditing(`${person.username}#${person.discriminator}`)}** has ${warnlogs.length} logs.`, embed})
            }
        }
    }
}
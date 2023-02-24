module.exports = {
    "name": "userinfo",
    "desc": "Gives the current information about a specified user, such as the Username, Discrim, ID, etc. ",
    "args": [
        {
            "opt": false,
            "arg": "@user",
            "longarg": "@user to get the user information of"
        }
    ],
    "aliases": [
        "ui"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "member",
                "description": "The member to retrieve information on",
                "required": true
            }
        ]
    },
    func: async function(ctx, msg, args) {
        let usr = (args.join(' ') || msg.author.id)
        let resolve = await ctx.utils.resolveGuildMember(msg.channel.guild, usr)
        member = await msg.channel.guild.members.find(member => member.id == resolve);
        if(!member) return msg.reply(`${ctx.fail} Please mention a valid user!`);
    
        const p = await ctx.utils.pronouns(ctx, member)
        let extname = ``;
        if(p.name !== member.username) {extname = ` **[**${ctx.utils.escapeDiscordsFuckingEditing(p.name)}**]**`}
        var supportertag = ''
        var isserverowner = ''
        var isabot = ''
        var nyxowner = ''
        var moderatortag = ''
        let pendingBotFetch = false;
        let embedcolor = ctx.utils.colors('random')
        let userstuff = await ctx.utils.lookupUser(ctx, member.id, true);
        let warnlogs = await ctx.utils.getLogs(ctx, member.id, msg.channel.guild.id, 'warn');
        let suffix = ''; if(warnlogs.length !== 1) suffix = `s`
        if(msg.channel.guild.ownerID) {
            if((msg.channel.guild.ownerID) === (member.id)) {
                isserverowner = '\n<:NyxMechanic:942164351064875008> Server Owner'
                embedcolor = ctx.utils.colors('white')
            }
        };
        let moderatorPerm = await ctx.utils.hasPermission(ctx, member.id, msg.channel.guild.id, 'mod')
        if(moderatorPerm.result && isserverowner.length === 0) {
            moderatortag = '\n<:NyxTOS:942164350985187358> Server Moderator'
            embedcolor = ctx.utils.colors('green_light')
        }
        if(ctx.elevated.find(id => id == member.id)) {
            nyxowner = '\n<:NyxPat:942164350771269662> Nyx Developer'
            embedcolor = ctx.utils.colors('red_light')
        }
        if(userstuff && userstuff.supporter) {
            supportertag = `\n<:NyxLove:942164350964228167> Nyx Supporter`
            embedcolor = ctx.utils.colors('purple')
        }
        if(member.bot) {
            isabot = '\n:robot: Discord Bot'
            embedcolor = ctx.utils.colors('blurple')
            pendingBotFetch = true;
        }
        var icons = `${nyxowner}${supportertag}${isabot}${isserverowner}${moderatortag}`
    
        let roletext; rolescounted = 0; missing = 0;
        member.roles.forEach(role => {
            if(!(rolescounted === 20)) {
                if(!roletext) {
                    roletext = `<@&${role}>`
                } else {
                    roletext = `${roletext} <@&${role}>`
                };
                rolescounted = rolescounted + 1
            } else {
                missing = missing + 1
            }
        })
    
        const timeA = await ctx.utils.timeConvert(Date.now() - member.createdAt, true, 3);
        const timeB = await ctx.utils.timeConvert(Date.now() - member.joinedAt, true, 3);
        let embd = {
            title: `${member.user.username}#${member.user.discriminator}${extname}`,
            description: icons,
            color: embedcolor,
            thumbnail: {url: member.avatarURL()},
            fields: [
                {
                    name: `**Registered:**`,
                    value: `${timeA} ago.`,
                    inline: true,
                },
                {
                    name: `**Joined Server:**`,
                    value: `${timeB} ago.`,
                    inline: true,
                },
                {
                    name: `**${rolescounted+missing} Roles:**`,
                    value: `${roletext || `N/A`}`,
                    inline: false,
                },
                {
                    name: `**User ID:**`,
                    value: `${member.id}`,
                    inline: true,
                },
                {
                    name: `**Warnings:**`,
                    value: `${warnlogs.length} warning${suffix}.`,
                    inline: true,
                },
            ]
        }
        const m = await msg.reply({content: `User Info of **${member.user.username.replace(/\*/g, '\\*')}**:`, embeds: [embd]});
        if(pendingBotFetch === true) {
            let servercount = null;
            let description = null;
            let website = null;
            let updated = false;
            let updatedDesc = `${icons}`
            function updateEmbed(type, response) {
                updated = true;
                if(type == 'servercount') {if(!servercount) {servercount = `${response}`; updatedDesc = updatedDesc + `\n${servercount}`}}
                if(type == 'description') {if(!description) {description = `${response}`; updatedDesc = `${description}\n` + updatedDesc}}
                if(type == 'website') {if(!website) {website = `${response}`; updatedDesc = updatedDesc + `\n${website}`}}
            }
            async function updateMessage() {
                embd.description = (updatedDesc);
                await m.edit({content: `User Info of **${member.user.username.replace(/\*/g, '\\*')}**:`, embeds: [embd]})
            }
            await ctx.libs.superagent.get(`https://top.gg/api/bots/${member.id}`)
                .set("Authorization", ctx.config.keys.topgg)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .then((res) => res.body).then(async res => {
                    if(!res.error) {
                        if(res.server_count && !(res.server_count == 0)) {
                            updateEmbed('servercount', `<:topgg:703535579937112139> ${res.server_count} servers.`)
                        }
                        if(res.shortdesc && !(res.shortdesc == '')) {
                            updateEmbed('description', `<:topgg:703535579937112139> - *${res.shortdesc.replace(/\*/g, '\\*')}*`)
                        }
                        if(res.website && !(res.website == '')) {
                            updateEmbed('website', `<:topgg:703535579937112139> [${member.user.username}'s website](${res.website})`)
                        }
                        await updateMessage()
                    }
                })
        }
    }
}
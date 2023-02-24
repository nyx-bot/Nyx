module.exports = {
    "name": "serverinfo",
    "desc": "Gives you the current information about a server, such as the server owner, the member count, server region, etc.",
    "args": [],
    "aliases": [
        "si",
        "serverdesc"
    ],
    func: async function(ctx, msg, args) {
        let guild = msg.channel.guild;
        let created = await ctx.utils.timeConvert(Date.now() - guild.createdAt, false, 2)
        let allMembers = await msg.channel.guild.fetchMembers()
        let mbmrcount = await allMembers.filter(member => member.user.bot === false).length; 
        let botcount = await allMembers.filter(member => member.user.bot === true).length; 
        let total = allMembers.length
        let suffix1 = '', suffix2 = '', suffix3 = '';
        let filtertext
        let mfa = `🔓 MFA disabled`
        switch (guild.explicitContentFilter) {
            case 0:
                filtertext = `None`
                break;
            case 1:
                filtertext = `Members Without Roles`
                break;
            case 2:
                filtertext = `Everyone`
                break;
            default:
                filtertext = `N/A`;
                break;
        };
        if(guild.mfaLevel) {mfa = `🔐 MFA enabled`};
        let roleA = Array.from(guild.roles);
        let roles; let countDone = 0; let missing = roleA.length;
        while(countDone !== 30 && countDone !== roleA.length) {
            ctx.timeout(10); role = roleA[countDone]; countDone++; missing--
            if(!roles) {roles = `<@&${role[0]}>`} else {roles = roles + ` <@&${role[0]}>`}
        }
        let missingtext = ``;
        if(missing !== 0) {missingtext = `  *and ${missing} more...*`};
        if(mbmrcount !== 1) suffix1 = `s`;
        if(botcount !== 1) suffix2 = `s`;
        if(total !== 1) suffix3 = `s`;
        let embed = {
            title: `Server info for **${guild.name.replace(/\*/g, '\\*')}**`,
            description: `Server created ${created} ago.`,
            fields: [{
                name: `**Owner:**`,
                value: `<@${guild.ownerID}>`,
                inline: true
            },
            {
                name: `**Server Tier:**`,
                value: `${guild.premiumTier}/3 (${guild.premiumSubscriptionCount} boosts)`,
                inline: true
            },
            {
                name: `**ID:**`,
                value: `${guild.id}`,
                inline: true
            },
            {
                name: `**Member Count:**`,
                value: `${mbmrcount} member${suffix1}`,
                inline: true,
            },
            {
                name: `**Bot Count:**`,
                value: `${botcount} bot${suffix2}`,
                inline: true,
            },
            {
                name: `**Total Server Members:**`,
                value: `${total} member${suffix3}`,
                inline: true,
            },
            {
                name: `**Moderation Protection:**`,
                value: mfa,
                inline: true,
            },
            {
                name: `**Content Filter:**`,
                value: filtertext,
                inline: true,
            },
            {
                name: `**Roles [${guild.roles.size}]**`,
                value: roles + missingtext,
                inline: true,
            },
        ],
        color: ctx.utils.colors('blurple')
        };
        return msg.reply({embed})
    }
}
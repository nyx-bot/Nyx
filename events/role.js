// everything includes event stuff, ctx, and meta.
async function check(ctx, guild, meta) { const g = await ctx.utils.lookupGuild(ctx, guild); if(g && g.logging === true && g.loggingchannelID !== null && g[`logging${meta}`] !== false && g.loggingchannelWebhook !== `{}`) {return g} else {return false} }

guildRoleCreate = async function(role, ctx, meta, mObj) {
    let guild = role.guild;
    if(guild) try {
        const g = await check(ctx, guild.id, meta)
        if(!g) return;
        let addedPerms = [];
        Object.entries(role.permissions.json).forEach(perm => {addedPerms.push(ctx.utils.roleTranslator(perm[0]))}); 
        const webhook = JSON.parse(g.loggingchannelWebhook)
        let embd = {
            title: `Created Role`,
            description: `Created **${role.name}** (<@&${role.id}>)`,
            color: role.color || ctx.utils.colors('green')
        };
        if(addedPerms.length !== 0) {
            embd.fields = [
                {
                    name: `Permissions:`,
                    value: `\`\`\`${addedPerms.join(', ')}\`\`\``,
                    inline: true,
                }
            ]
        }
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {console.de(e)}
}

guildRoleUpdate = async function(role, oldRole, ctx, meta, mObj) {
    let guild = role.guild;
    if(guild) try {
        const g = await check(ctx, guild.id, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook)
        let removedPerms = []; let addedPerms = [];
        Object.entries(role.permissions.json).forEach(perm => {if(!Object.entries(oldRole.permissions.json).find(permB => permB[0] == perm[0])) {addedPerms.push(ctx.utils.roleTranslator(perm[0]))}}); 
        Object.entries(oldRole.permissions.json).forEach(perm => {if(!Object.entries(role.permissions.json).find(permB => permB[0] == perm[0])) {removedPerms.push(ctx.utils.roleTranslator(perm[0]))}}); 
        let embd = {
            title: `Updated Role`,
            description: `Updated **${role.name}** (<@&${role.id}>)`,
            fields: [],
            color: role.color || ctx.utils.colors('gold')
        }; if(removedPerms.length !== 0) {
            embd.fields.push({
                name: `Removed Permissions`,
                value: `\`${removedPerms.join('`, `')}\``,
                inline: true,
            })
        }; if(addedPerms.length !== 0) {
            embd.fields.push({
                name: `Added Permissions`,
                value: `\`${addedPerms.join('`, `')}\``,
                inline: true,
            })
        }; 
        
        for(k of Object.keys(oldRole)) {
            let old = oldRole[k];
            let updated = role[k];

            if((typeof updated == `string` || typeof old == `string`) && updated != old) {
                if(k == `color`) {
                    embd.fields.push({
                        name: `Updated ${k[0].toUpperCase() + k.slice(1)}`,
                        value: `#${oldRole.color.toString(16)} -> #${role.color.toString(16)}`,
                        inline: true
                    })
                } else {
                    if(old.length + updated.length > 614) {
                        embd.fields.push({
                            name: `Previous ${k[0].toUpperCase() + k.slice(1)}`,
                            value: `${old || `--`}`,
                            inline: true
                        }, {
                            name: `New ${k[0].toUpperCase() + k.slice(1)}`,
                            value: `${updated || `--`}`,
                            inline: true
                        })
                    } else embd.fields.push({
                        name: `Updated ${k[0].toUpperCase() + k.slice(1)}`,
                        value: `\`${old || `--`}\` -> \`${updated || `--`}\``,
                        inline: true
                    })
                }
            } else if((typeof updated == `number` || typeof old == `number`) && updated != old) {
                if(k !== `position` || (k == `position` && (updated - old !== -1 && updated - old !== 1))) embd.fields.push({
                    name: `Updated ${k[0].toUpperCase() + k.slice(1)}`,
                    value: `${old || `--`} -> ${updated || `--`}`,
                    inline: true
                })
            } else if((typeof updated == `boolean` || typeof old == `boolean`) && updated != old) {
                embd.fields.push({
                    name: `Updated ${k[0].toUpperCase() + k.slice(1)}`,
                    value: `\`${old || `false`}\` -> \`${updated || `false`}\``,
                    inline: true
                })
            }
        }
        
        if(embd.fields.length > 0) ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {console.de(e)}
}

guildRoleDelete = async function(role, ctx, meta, mObj) {
    let guild = role.guild;
    if(guild) try {
        const g = await check(ctx, guild.id, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook)
        let embd = {
            title: `Removed Role`,
            description: `Removed **${role.name}** (${role.id})`,
            color: ctx.utils.colors('red')
        };
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {console.de(e)}
}

module.exports = [
    {
        event: "guildRoleCreate",
        name: "Role Creation",
        func: guildRoleCreate
    },
    {
        event: "guildRoleUpdate",
        name: "Role Editing",
        func: guildRoleUpdate
    },
    {
        event: "guildRoleDelete",
        name: "Role Deletion",
        func: guildRoleDelete
    },
];
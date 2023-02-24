// everything includes event stuff, ctx, and meta.
async function check(ctx, guild, meta) { const g = await ctx.utils.lookupGuild(ctx, guild); if(g && g.logging === true && g.loggingchannelID !== null && g[`logging${meta}`] !== false && g.loggingchannelWebhook !== `{}`) {return g} else {return false} }

autorole = async function(guild, member, ctx) {
    try {
        if(!member.username) try { member = await ctx.utils.resolveUser(member.id) } catch(e) {}
        const guildSetting = await ctx.utils.lookupGuild(ctx, guild.id, true);
        if(guildSetting.autorole && guildSetting.autoRolesList !== '[]') {
            const roles = JSON.parse(guildSetting.autoRolesList);
            const applicable = await new Promise(async (res, rej) => {
                const rols = []
                const botHighest = await ctx.utils.highestRoleNumber(guild, guild.me.roles);
                roles.forEach(roleID => {
                    if(guild.roles.find(role => role.id == roleID) && guild.roles.find(role => role.id == roleID).position < botHighest) {
                        rols.push(roleID)
                    }
                });
                res(rols)
            });
            if(applicable.length !== 0) {
                await member.edit({
                    roles: applicable
                }, `Autorole`)
            }
        }
    } catch(e) {}
};

remuteMembers = async function(guild, member, ctx) {
    try {
        const mute = await ctx.seq.models.Mutes.findOne({where: {guildId: guild.id, userId: member.id}, raw: true,});
        if(mute) {
            await ctx.timeout(500)
            await member.edit({
                roles: [mute.muteRole]
            }, `Member was previously muted`)
        }
    } catch(e) {}
}

guildMemberAdd = async function(member, ctx, meta, mObj) {
    let guild = member.guild;
    if(guild) try {
        if(!member.username) try { member = await ctx.utils.resolveUser(member.id) } catch(e) {}
        if(!ctx.cache.joinLeave[guild.id]) {ctx.cache.joinLeave[guild.id] = [0, 0]};
        ctx.cache.joinLeave[guild.id][0]++;
        setTimeout(() => {
            if(typeof ctx.cache.joinLeave[guild.id] == `object`) {
                ctx.cache.joinLeave[guild.id][0]--;
                if(ctx.cache.joinLeave[guild.id][0] === 0 && ctx.cache.joinLeave[guild.id][1] === 0) {delete ctx.cache.joinLeave[guild.id]}
            }
        }, 3.6e+6)
        autorole(guild, member, ctx);
        remuteMembers(guild, member, ctx);
        const g = await check(ctx, guild.id, meta)
        const guildSetting = await ctx.utils.lookupGuild(ctx, guild.id, true)
        console.d(`g:`, g, `guildSetting:`, guildSetting)
        if(guildSetting !== null && guildSetting.welcome && guildSetting.welcomeChannel !== null) {
            try {
                console.d(`welcomes are enabled!!`)
    
                const channel = await ctx.bot.getChannel(guildSetting.welcomeChannel);
    
                let msgs = JSON.parse(guildSetting.welcomeMsg);
    
                const standardWelcomeMessage = async () => {
                    if(msgs.length !== 0) try {
                        await channel.createMessage({
                            content: msgs[Math.floor((Math.random() * msgs.length))].replace(/{@member}/g, member.mention).replace(/{member}/g, `${member.username}#${member.discriminator}`).replace(/{server}/g, `${guild.name}`).replace(/{membercount}/g, `${guild.members.size}`),
                            allowedMentions: {
                                users: true,
                            }
                        })
                    } catch(e) {}
                };
    
                require('fs').readdir(`./etc/backgrounds`, async (e, ids) => {
                    if(!e) {
                        console.d(`successfuly searched background!`)
                        const thisServer = ids.find(i => i.startsWith(guild.id))
                        if(thisServer) {
                            require('fs').readFile(`./etc/backgrounds/${thisServer}`, (e, buffer) => {
                                if(e) {
                                    console.error(e);
                                    return standardWelcomeMessage();
                                }

                                let payload = {
                                    name: `${member.username}#${member.discriminator}`,
                                    url: member.avatarURL.split(`size=`)[0] + `size=256`,
                                    message: guildSetting.welcomeImgMsg.length > 0 ? guildSetting.welcomeImgMsg : null,
                                    image: true
                                };

                                if(!e && buffer.length > 1) {
                                    payload.bg = buffer
                                };

                                let url = `${ctx.config.welcomeImagesEndpoint}nyxwelcome`

                                console.d(`Sending payload to ${url}`)

                                ctx.libs.superagent.post(url).set(`authorization`, ctx.keys.nyxbotapi).send(payload).then(async res => {
                                    const r = res.body;

                                    console.d(r.length ? r.length : r);

                                    let content = {
                                        allowedMentions: {
                                            users: true,
                                        }
                                    };

                                    if(msgs.length > 0) content.content = msgs[Math.floor((Math.random() * msgs.length))].replace(/{@member}/g, member.mention).replace(/{member}/g, `${member.username}#${member.discriminator}`).replace(/{server}/g, `${guild.name}`).replace(/{membercount}/g, `${guild.members.size}`);

                                    console.d(content)

                                    channel.createMessage(content, {
                                        name: `welcome-${member.id}.${res.headers[`content-type`].split(`/`)[1]}`,
                                        file: r
                                    });
                                }).catch(console.error)
                            })
                        } else standardWelcomeMessage()
                    } else standardWelcomeMessage()
                })
            } catch(e) {
                console.de(e)
            }
        }
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook)
        const accCreated = await ctx.utils.timeConvert(Date.now() - member.createdAt, false, 3)

        let fields = [
            {
                name: `Account Created:`,
                value: `${accCreated} ago.`,
                inline: true,
            },
        ];
                
        const changed = await new Promise(async resolve => {
            let res = obj => {
                if(typeof obj != `object`) {
                    resolve(null)
                } else {
                    if(Object.entries(obj).length > 0) {
                        const results = Object.values(obj).filter(o => o.updatedUses > 0)

                        resolve({
                            first: results[0],
                            results,
                        })
                    } else resolve(null)
                }
            }

            ctx.utils.updateGuildInvites({ctx, id: guild.id}).then(res).catch(e => {
                console.error(e)
                res([])
            })
        });

        console.d(changed)

        if(changed && changed.first) {
            let user = guild.members.get(changed.first.inviter) || changed.first.inviter;

            if(typeof user == `string`) user = await ctx.rest.getRESTUser(user);

            fields.push({
                name: `${changed.results.length > 1 ? `(Potentially) ` : ``}Invited by:`,
                value: `${user.username}#${user.discriminator} through \`discord.gg/${changed.first.code}\``,
                inline: true
            })
        }

        let embd = {
            title: `Member Joined!`,
            description: `${member.username}#${member.discriminator} (<@${member.id}>)`,
            fields,
            thumbnail: {url: member.avatarURL},
            color: ctx.utils.colors('green')
        };
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {console.de(e)}
},

guildMemberRemove = async function(member, ctx, meta, mObj) {
    let guild = member ? member.guild : null;
    if(typeof member == `object` && member.id && guild) try {
        if(!member.username) try { member = await ctx.utils.resolveUser(member.id) } catch(e) {}
        if(!ctx.cache.joinLeave[guild.id]) {ctx.cache.joinLeave[guild.id] = [0, 0]};
        ctx.cache.joinLeave[guild.id][1]++;
        setTimeout(() => {
            if(typeof ctx.cache.joinLeave[guild.id] == `object`) {
                ctx.cache.joinLeave[guild.id][1]--;
                if(ctx.cache.joinLeave[guild.id][0] === 0 && ctx.cache.joinLeave[guild.id][1] === 0) {delete ctx.cache.joinLeave[guild.id]}
            }
        }, 3.6e+6)
        const g = await check(ctx, guild.id, meta)
        const guildSetting = await ctx.utils.lookupGuild(ctx, guild.id, true)
        if(guildSetting !== null && guildSetting.welcome && JSON.parse(guildSetting.leaveMsg).length !== 0 && guildSetting.welcomeChannel !== null) {
            let msgs = JSON.parse(guildSetting.leaveMsg);
            try {
                const channel = await ctx.bot.getChannel(guildSetting.welcomeChannel);
                const count = new Promise(res => {guild.fetchAllMembers(1500).then(res).catch(e => res(guild.members.size))})
                await channel.createMessage(msgs[Math.floor((Math.random() * msgs.length))].replace(/{@member}/g, `<@${member.id}>`).replace(/{member}/g, `${member.username}#${member.discriminator}`).replace(/{server}/g, `${guild.name}`).replace(/{membercount}/g, `${count}`))
            } catch(e) {}
        }
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook)
        const accCreated = await ctx.utils.timeConvert(Date.now() - member.createdAt, false, 3)
        let embd = {
            title: `Member Left!`,
            description: `${member.username}#${member.discriminator} (<@${member.id}>)`,
            fields: [
                {
                    name: `Account Created:`,
                    value: `${accCreated} ago.`,
                    inline: true,
                },
            ],
            thumbnail: {url: member.avatarURL},
            color: ctx.utils.colors('red')
        };
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {console.de(e)}
};

userUpdate = async function(user, oldUser, ctx, meta, mObj) {
    if(!user.bot) try {
        if(`${user.username}#${user.discriminator}` !== `${oldUser.username}#${oldUser.discriminator}`) {
            let embd = {
                title: `Member Username Changed!`,
                description: `${user.username}#${user.discriminator} (<@${user.id}>)`,
                fields: [
                    {
                        name: `Old Username`,
                        value: `${oldUser.username}#${oldUser.discriminator}`,
                        inline: true
                    },
                    {
                        name: `New Username`,
                        value: `${user.username}#${user.discriminator}`,
                        inline: true
                    },
                ],
                thumbnail: {url: user.avatarURL},
                color: ctx.utils.colors('gold')
            };
            let guilds = {all: ctx.bot.guilds.filter(g => g.members.has(user.id))};
            //ctx.bot.guilds.forEach(guild => {if(guild.members.has(user.id)) {guilds.all.push(guild.id)}});
            if(guilds.all.length !== 0) {
                for(i in guilds.all) {
                    const g = await check(ctx, guilds.all[i], meta)
                    if(g) {
                        const webhook = JSON.parse(g.loggingchannelWebhook);
                        await ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
                            embeds: [embd], 
                            avatarURL: mObj.icon, 
                            username: mObj.name
                        }).catch(e => {});
                        await ctx.timeout(250);
                    }
                }
            }
        }; if(`${oldUser.avatar}` !== `${user.avatar}`) {
            let embd = {
                title: `Member Avatar Changed!`,
                description: `${user.username}#${user.discriminator} (<@${user.id}>)`,
                fields: [
                    {
                        name: `Old Avatar`,
                        value: `**[URL](https://cache.nyx.bot/${user.id}/${oldUser.avatar})**`,
                        inline: true
                    },
                    {
                        name: `New Avatar`,
                        value: `**[URL](${user.avatarURL})**`,
                        inline: true
                    },
                ],
                thumbnail: {url: user.avatarURL},
                color: ctx.utils.colors('gold')
            };
            let guilds = {all: []};
            ctx.bot.guilds.forEach(guild => {if(guild.members.has(user.id)) {guilds.all.push(guild.id)}});
            if(guilds.all.length !== 0) {
                ctx.libs.superagent.post(ctx.config.cacheApi + `saveFile`).set(`auth`, ctx.config.keys.cacheApi).send({url: user.avatarURL}).then(r => {}).catch(e => {})
                for(i in guilds.all) {
                    const g = await check(ctx, guilds.all[i], meta)
                    if(g) {
                        const webhook = JSON.parse(g.loggingchannelWebhook);
                        await ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
                            embeds: [embd], 
                            avatarURL: mObj.icon, 
                            username: mObj.name
                        }).catch(e => {});
                        await ctx.timeout(250);
                    }
                }
            }
        }
    } catch(e) {console.de(e)}
}

guildMemberUpdate = async function(member, oldMember, ctx, meta, mObj) {
    let guild = member.guild;
    if(guild) try {
        const g = await check(ctx, guild.id, meta)
        if(!g) return;
        const webhook = JSON.parse(g.loggingchannelWebhook)
        let embd;
        if(oldMember.roles.length !== member.roles.length) {let key = `Added`; let suffix = ``; let key2 = ``
            let diff = oldMember.roles.length - member.roles.length
            if(diff > 0) {key = `Removed!`; key2 = `from`} else {key = `Added!`; key2 = `to`}; if(diff === 1 || diff === -1) {suffix = `s`}
            embd = {
                title: `Member Role${suffix} ${key}`,
                description: `Roles **${key.replace('!', '')}** ${key2} ${member.username}#${member.discriminator} (<@${member.id}>)`,
                thumbnail: {url: member.avatarURL},
                color: ctx.utils.colors('gold')
            };
            let addedRoles = [];
            member.roles.forEach(async role => {
                if(!oldMember.roles.find(rol => rol == `${role}`)) {
                    addedRoles.push(`<@&${role}>`)
                }
            });
            if(addedRoles.length !== 0) {
                if(!embd.fields) {embd.fields = []}
                embd.fields.push({
                    name: `Added Role${suffix}`,
                    value: `${addedRoles.join(', ')}`,
                    inline: true,
                })
            }
            let removedRoles = [];
            oldMember.roles.forEach(async role => {
                if(!member.roles.find(rol => rol == `${role}`)) {
                    removedRoles.push(`<@&${role}>`)
                }
            });
            if(removedRoles.length !== 0) {
                if(!embd.fields) {embd.fields = []}
                embd.fields.push({
                    name: `Removed Role${suffix}`,
                    value: `${removedRoles.join(', ')}`,
                    inline: true,
                })
            }
        } else if(oldMember.nick !== member.nick) {
            embd = {
                title: `Member Nickname Changed!`,
                description: `${member.username}#${member.discriminator} (<@${member.id}>)`,
                fields: [
                    {
                        name: `Old Nickname`,
                        value: `${oldMember.nick || member.username}`,
                        inline: true
                    },
                    {
                        name: `New Nickname`,
                        value: `${member.nick || member.username}`,
                        inline: true
                    },
                ],
                thumbnail: {url: member.avatarURL},
                color: ctx.utils.colors('gold')
            };
        }
        ctx.bot.rest.webhooks.execute(webhook.id, webhook.token, {
            embeds: [embd], 
            avatarURL: mObj.icon, 
            username: mObj.name
        }).catch(e => {})
    } catch(e) {console.de(e)}
};

module.exports = [
    {
        event: "guildMemberAdd",
        name: "Member Joining",
        func: guildMemberAdd
    },
    {
        event: "guildMemberRemove",
        name: "Member Leaving",
        func: guildMemberRemove
    },
    {
        event: "guildMemberUpdate",
        name: "Member Updates",
        func: guildMemberUpdate
    },
    {
        event: "userUpdate",
        name: "User Updates",
        func: userUpdate
    },
];
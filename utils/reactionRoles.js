const defaultContent = ({ ctx, dbEntry, name }) => `**Reaction Roles:** ${ctx.utils.escapeDiscordsFuckingEditing(name)}\n\nThis is the default message for a new reaction role system!\n\nYou can edit this message by running \`/reactionsetmessage ${dbEntry.id} {new message here!}\``

const createMessageObject = ({ ctx, dbEntry }) => {
    console.d(dbEntry)
    const roles = JSON.parse(dbEntry.roles);
    console.d(roles)

    let components = [];

    for (i in roles) {
        let role = roles[i];

        console.d(role)

        if(i % 5 == 0) components.push({
            type: 1,
            components: []
        });

        const g = ctx.bot.guilds.get(dbEntry.serverID);
        const roleObj = g && g.roles ? (g.roles.get(role.roleID) || null) : null;

        components[components.length-1].components.push({
            type: 2,
            style: 2,
            emoji: role.emoji || undefined,
            label: roleObj && roleObj.name ? roleObj.name : role.label,
            customID: `rraddrole-${role.roleID}`,
        })
    }

    let obj = { content: dbEntry.content && dbEntry.content != `-- no message --` ? dbEntry.content : defaultContent({ctx, dbEntry, name: dbEntry.name}), components };

    console.d(`Created RR object:`, JSON.stringify(obj, null, 4))

    return obj;
}

module.exports = {
    get: ({ ctx, serverID, name, messageID, id }) => new Promise(async (res, rej) => {
        let opt = { serverID };

        if(name) opt.name = name;
        if(messageID) opt.messageID = messageID
        if(id) opt.id = id

        const rr = await ctx.seq.models.ReactionRole.findOne({ where: opt, raw: true, });

        if(rr) {
            let channel = ctx.bot.getChannel(rr.channelID);
    
            res({
                message: await new Promise(r => ctx.bot.rest.channels.getMessage(rr.channelID, rr.messageID).then(r).catch(e => {console.warn(`Failed to fetch message ${rr.messageID} for RR; ${e}`); r(null)})),
                channel,
                dbEntry: rr
            })
        } else res(null)
    }),
    setMessage: ({ ctx, serverID, name, content }) => new Promise(async (res, rej) => {
        const rr = await ctx.seq.models.ReactionRole.findOne({ where: {serverID, name}, raw: true, });

        if(rr) {
            try {
                await ctx.seq.models.ReactionRole.update({ content }, { where: {serverID, name} });
                
                const dbEntry = await ctx.seq.models.ReactionRole.findOne({ where: {serverID, name}, raw: true, });

                let message = await ctx.bot.rest.channels.getMessage(dbEntry.channelID, dbEntry.messageID);

                message.edit(createMessageObject({ctx, dbEntry: dbEntry})).then(msg => {
                    res({msg, dbEntry: dbEntry})
                }).catch(e => {
                    console.error(e)
                    rej(`Failed to update reactionrole -- ${e}`)
                })
            } catch(e) {
                console.error(e)
                rej(`Failed to update reactionrole -- ${e}`)
            }
        } else rej("There is no reaction role that exists under this name")
    }),
    buttons: {
        add: ({ ctx, serverID, name, role, emoji }) => new Promise(async (res, rej) => {
            const rr = await ctx.seq.models.ReactionRole.findOne({ where: {serverID, name}, raw: true, });
    
            if(rr) {
                let message = await ctx.bot.rest.channels.getMessage(rr.channelID, rr.messageID);

                if(typeof role == `string`) role = ctx.bot.guilds.get(rr.serverID).roles.get(role);

                const newRoles = [...JSON.parse(rr.roles), {
                    roleID: role.id,
                    emoji,
                    label: role.name
                }]

                await ctx.seq.models.ReactionRole.update({
                    roles: JSON.stringify(newRoles)
                }, { where: {serverID, name} });

                const updatedEntry = await ctx.seq.models.ReactionRole.findOne({ where: {serverID, name}, raw: true, })

                message.edit(createMessageObject({ctx, dbEntry: updatedEntry})).then(msg => {
                    res({msg, dbEntry: updatedEntry})
                }).catch(e => {
                    console.error(e)
                    rej(`Failed to update reactionrole -- ${e}`)
                })
            } else rej("There is no reaction role that exists under this name")
        }),
        remove: ({ ctx, serverID, name, role }) => new Promise(async (res, rej) => {
            const rr = await ctx.seq.models.ReactionRole.findOne({ where: {serverID, name}, });
    
            if(rr) {
                let message = await ctx.bot.rest.channels.getMessage(rr.channelID, rr.messageID);

                if(typeof role == `string`) role = ctx.bot.guilds.get(rr.serverID).roles.get(role);

                const roles = JSON.parse(rr.roles);

                if(roles.find(o => o.roleID == role.id)) {
                    await ctx.seq.models.ReactionRole.update({
                        roles: JSON.stringify(roles.filter(o => o.roleID != role.id))
                    }, { where: {serverID, name}, raw: true })
                    
                    const updatedEntry = await ctx.seq.models.ReactionRole.findOne({ where: {serverID, name}, raw: true, })
    
                    message.edit(createMessageObject({ctx, dbEntry: updatedEntry})).then(msg => {
                        res({msg, dbEntry: updatedEntry})
                    }).catch(e => {
                        console.error(e)
                        rej(`Failed to update reactionrole -- ${e}`)
                    })
                } else {
                    rej(`This role is not on the list!`)
                }
            } else rej("There is no reaction role that exists under this name")
        }),
    },
    message: {
        create: ({ ctx, serverID, name, channel }) => new Promise(async (res, rej) => {
            const rr = await ctx.seq.models.ReactionRole.findOne({ where: {serverID, name}, raw: true, });
    
            if(rr) {
                console.d(channel)
                channel.createMessage(createMessageObject({ ctx, dbEntry: rr })).then(async msg => {
                    console.d(`Updating reactionrole...`)
                    ctx.seq.models.ReactionRole.update( { messageID: msg.id, channelID: channel.id }, { where: {serverID, name} } ).then(async () => {
                        console.d(`Updated reactionrole`)
                        const dbEntry2 = await ctx.seq.models.ReactionRole.findOne({ where: {name, serverID}, raw: true, })
                        res({ msg, dbEntry: dbEntry2 })
                    }).catch(e => console.error(`ERROR WHILE UPDATING RR DB ENTRY: ${e}`))
                }).catch(e => {
                    console.error(e);
                    rej(`Failed to create message! (${e})`)
                })
            } else rej("There is no reaction role that exists under this name")
        }),
        delete: ({ ctx, serverID, name }) => new Promise(async (res, rej) => {
            const rr = await ctx.seq.models.ReactionRole.findOne({ where: {serverID, name}, raw: true, });
    
            if(rr) {
                if(!rr.messageID || !rr.channelID) return rej(`There is no message to delete!`)

                const delFromDB = async () => ctx.seq.models.ReactionRole.update({
                    messageID: null
                }, { where: {serverID, name} }).then(() => {
                    res(true)
                }).catch(e => {
                    rej(`Failed to delete from DB! ${e}`)
                })

                ctx.bot.rest.channels.getMessage(rr.channelID, rr.messageID).then(async msg => {
                    await msg.delete();
                    delFromDB();
                }).catch(delFromDB)
            } else rej("There is no reaction role that exists under this name")
        }),
        move: ({ ctx, serverID, name, channel }) => new Promise(async (res, rej) => {
            const rr = await ctx.seq.models.ReactionRole.findOne({ where: {serverID, name}, raw: true, });
    
            if(rr) {
                try {
                    await module.exports.message.delete({ ctx, serverID, name });
                    console.d(`Deleted old message!`)
                } catch(e) {
                    console.warn(`Delete function failed: ${e}`)
                }
                
                module.exports.message.create({ctx, serverID, name, channel}).then(res).catch(rej)
            } else rej("There is no reaction role that exists under this name")
        })
    },
    create: ({ ctx, serverID, name, channel }) => new Promise(async (res, rej) => {
        const exists = await ctx.seq.models.ReactionRole.findOne({ where: {name}, raw: true, });
        console.d(`Exists?`, exists)
        if(!exists) {
            const opt = {name, serverID, channelID: channel.id}
            let a = await ctx.seq.models.ReactionRole.build(opt); await a.save();
            
            module.exports.message.create({ctx, serverID, name, channel}).then(res).catch(rej)
        } else rej(`Reaction role already exists under this name!`)
    }),
    delete: ({ ctx, serverID, name }) => new Promise(async (res, rej) => {
        const rr = await ctx.seq.models.ReactionRole.findOne({ where: {serverID, name}, raw: true, });

        if(rr) {
            try {
                await module.exports.message.delete({ctx, serverID, name})
            } catch(e) {
                console.warn(`Failed to delete rr message: ${e}`)
            };

            ctx.seq.models.ReactionRole.destroy({ where: {serverID, name} }).then(() => {
                console.d(`Destroyed RR entry`);
                res(null)
            }).catch(e => rej(`Failed to destroy DB entry: ${e}`))
        } else rej("There is no reaction role that exists under this name")
    })
}
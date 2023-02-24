module.exports = {
    "name": "rraddrole",
    "desc": "Add a role (internal command for reaction roles)",
    "interactionObject": {},
    func: async function rraddrole(ctx, msg, args) {
        if(msg.type) {
            try {
                const role = msg.channel.guild.roles.get(args[0]);

                if(role) {
                    const roleHeight = role.position
                    const botHeight = await ctx.utils.highestRoleNumber(msg.channel.guild, msg.channel.guild.me.roles);

                    if(roleHeight >= botHeight) return msg.reply({
                        flags: 64,
                        content: `${ctx.fail} I'm unable to manage this role because it's higher than my role!\n\n(<https://support.discord.com/hc/en-us/articles/214836687-Role-Management-101>)\n\nThis is not a bug. Please make sure to let the server administration know!`
                    })

                    const rr = await ctx.utils.reactionRoles.get({ctx, serverID: msg.channel.guild.id, messageID: msg.message.id});

                    if(msg.member.roles.find(s => s == role.id)) {
                        console.log(`Member already has role!`)
                        
                        const m = await msg.reply({
                            flags: 64,
                            content: `You already have this role! (${ctx.utils.escapeDiscordsFuckingEditing(role.name)}) -- do you want to remove it?`,
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2,
                                            style: 4,
                                            label: `Confirm`,
                                            customID: `confirm`,
                                            disabled: false,
                                        },
                                    ]
                                }
                            ]
                        })

                        ctx.cache[`confirm${msg.author.id}`] = {
                            guild: msg.channel.guild.id,
                            run: async (ctxN, msgN, argsN) => {
                                clearTimeout(ctx.cache[`confirm${msg.author.id}`].timeout);
                                delete ctx.cache[`confirm${msg.author.id}`]
                                msg.member.removeRole(role.id, `Reaction role; member opted to remove role ${role.name} under list "${rr.dbEntry.name}"`);
                                msg.deleteOriginal();
                                msg.createFollowup({
                                    content: `${ctx.pass} Removed role **${ctx.utils.escapeDiscordsFuckingEditing(role.name)}** (${args[0]})`,
                                    flags: 64,
                                    components: [
                                        {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 2,
                                                    style: 4,
                                                    label: `Confirm`,
                                                    customID: `confirm`,
                                                    disabled: true,
                                                },
                                            ]
                                        }
                                    ]
                                })
                            }, 
                            timeout: setTimeout(() => {
                                m.edit({
                                    content: `~~${m.content}~~\n\nYou didn't confirm in time!`,
                                    components: [
                                        {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 2,
                                                    style: 4,
                                                    label: `Confirm`,
                                                    customID: `confirm`,
                                                    disabled: true,
                                                },
                                            ]
                                        }
                                    ]
                                });
                                delete ctx.cache[`confirm${msg.author.id}`]
                            }, 15000)
                        };
                    } else {
                        console.log(`Member does not have role!`)

                        msg.member.addRole(role.id, `Reaction role; selected role ${role.name} under list "${rr.dbEntry.name}"`)
    
                        msg.reply({
                            flags: 64,
                            content: `${ctx.pass} Added role **${ctx.utils.escapeDiscordsFuckingEditing(role.name)}** (${args[0]})`
                        })
                    }
                } else msg.reply({
                    flags: 64,
                    content: `${ctx.fail} I can't add this role to you, because I can't find it! (maybe deleted?)`
                })
            } catch(e) {
                msg.reply({
                    flags: 64,
                    content: `${ctx.fail} Failed to add role! (${e})`
                })
            }
        } else console.warn(`rraddrole was called on guild ${msg.channel.guild.id} / msg ${msg.channel.guild.id} with args "${args.join(` `)}" but NOT AS AN INTERACTION!`)
    }
}
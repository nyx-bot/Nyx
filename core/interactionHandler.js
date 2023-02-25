module.exports = async (ctx, interaction) => {
     interaction.beginProcess = Date.now();
     interaction.prefix = `/`
     let args = [], attachments = [];

     interaction.channel.guild.me = interaction.channel.guild.members.get(ctx.bot.user.id)

     interaction.mentions = {
          channels: [],
          everyone: false,
          members: [],
          roles: [],
          users: []
     };

     //console.log(interaction.data)

     if(interaction.type === 3) {
          //interaction.acknowledged = true;
          if(!interaction.data.values) interaction.data.values = []
          args = interaction.data.values;
          interaction.content = args.join(` `)
          console.d(`interaction is a selector, setting "acknowledged" to ${interaction.acknowledged} & args as [${interaction.data.values.join(`, `)}]`)
     };

     if(interaction.data.customID && !ctx.cmds[interaction.data.customID]) {
          let args2 = (interaction.data.customID || ``).split(`-`);
          console.d(`no cmd, args parsed as:`, args2)
          if(ctx.cmds.has(args2[0])) {
               console.d(`Found interaction for ${interaction.data.customID} (split by "-") -- ${args[0]}`)
               interaction.data.customID = args2.shift();
               args = args2;
               interaction.content = args.join(` `)
               interaction.data.values = args2;
          } else console.d(`no cmd`, interaction)
     }

     console.d(interaction.data.options)

     if(interaction.data.options && typeof interaction.data.options == `object` && interaction.data.options.raw && typeof interaction.data.options.raw.length == `number`) for(opt of interaction.data.options.raw) {
          if(opt.value !== undefined) {
               if(opt.type == 11) {
                    console.d(interaction.data.resolved.attachments)
                    if(interaction.data.resolved && interaction.data.resolved.attachments && interaction.data.resolved.attachments[opt.value]) {
                         console.d(`data for resolved attachments exist!`)
                         attachments.push(interaction.data.resolved.attachments[opt.value])
                    } else attachments.push(opt)
               } else if(opt.type == 6) {
                    interaction.mentions.members.push(interaction.channel.guild.members.find(m => m.id == opt.value) || (await interaction.channel.guild.fetchMembers({userIDs: [opt.value]})))
                    args.push(opt.value.toString())
                    console.d(interaction.mentions)
                    console.d(...opt.value.toString().split(` `))
               } else {
                    args.push(...opt.value.toString().split(` `))
               }
          } else {
               args.push(opt.name);
               if(opt.options && typeof opt.options == `object` && typeof opt.options.length == `number`) {
                    opt.options.forEach(opt2 => {
                         if(opt2.value !== undefined) {
                              if(opt2.type !== 11) {
                                   args.push(...opt2.value.toString().split(` `))
                              } else {
                                   attachments.push(opt2.value)
                              }
                         } else {
                              args.push(opt2.name)
                         }
                    })
               }
          }
     };

     interaction.reply = function reply(...content) {
          return new Promise(async (res, rej) => {
               let opt = ctx.core.parseReplyContent({msg: interaction, content});
     
               //interaction.acknowledged = true;
               console.d(`reply called, ${interaction.acknowledged ? `editing` : `creating first message`} (${typeof interaction.acknowledged} / ${interaction.type})`)
               // acknowledges: acknowledge, createMessage, defer
               // not ack: createFollowup, deleteMessage, deleteOriginalMessage, editMessage, editOriginal
     
               let editReply = (...opt) => new Promise(async (res, rej) => {
                    interaction.editOriginal(ctx.core.parseReplyContent({msg: interaction, content: opt})).then(async () => {
                         let o = await interaction.getOriginal()
                         o.edit = (...o2) => editReply(...o2); 
                         res(o)
                    }).catch(rej)
               });
     
               console.log(content)
     
               const originalMessageExists = (flags) => new Promise(async res => {
                    /*try {
                         await interaction.defer(flags ? flags : undefined)
                    } catch(e) {
                         return res(false)
                    }*/
     
                    interaction.getOriginal().then(msg => {
                         console.d(`ORIGINAL EXISTS`)
                         if(msg.id) {
                              res(true)
                         } else {
                              console.d(`...but no msg id was found`)
                              res(false)
                         }
                    }).catch(e => {
                         console.warn(`ORIGINAL DOES NOT EXIST; ERROR: ${e}`)
                         res(false)
                    })
               })
     
               if(interaction.type === 3) {
                    if(opt[0]) {
                         opt[0].flags = 64
                    }
                    if(opt[0] && opt[0].flags) {
                         const exists = typeof interaction.acknowledged == `boolean` ? interaction.acknowledged : await originalMessageExists(opt[0].flags)
     
                         return interaction[exists ? `createFollowup` : `createMessage`](...opt).then(o => {
                              interaction.getOriginal().then(o2 => {
                                   o2.edit = (...content) => editReply(...content)
                                   res(o2)
                              }).catch(rej)
                         }).catch(e => {
                              if(exists) {
                                   return interaction.editOriginal(...opt).then(o => {
                                        interaction.getOriginal().then(o2 => {
                                             o2.edit = (...content) => editReply(...content)
                                             res(o2)
                                        }).catch(rej)
                                   }).catch(rej)
                              } else rej(e)
                         })
                    } else {
                         const exists = typeof interaction.acknowledged == `boolean` ? interaction.acknowledged : await originalMessageExists()
     
                         /*await interaction.defer();
     
                         const exists = await originalMessageExists()*/
     
                         return interaction.editOriginal(...opt).then(o => {
                              interaction.getOriginal().then(o2 => {
                                   o2.edit = (...content) => editReply(...content)
                                   res(o2)
                              }).catch(rej)
                         }).catch(e => {
                              console.warn(`${e}`)
                              return interaction.createFollowup(...opt).then(o => {
                                   interaction.getOriginal().then(o2 => {
                                        o2.edit = (...content) => editReply(...content)
                                        res(o2)
                                   }).catch(rej)
                              }).catch(rej)
                         })
                    }
               } else {
                    const exists = typeof interaction.acknowledged == `boolean` ? interaction.acknowledged : await originalMessageExists()
     
                    if(exists) {
                         return interaction.editOriginal(...opt).then(o => {
                              interaction.getOriginal().then(o2 => {
                                   o2.edit = (...content) => editReply(...content)
                                   res(o2)
                              }).catch(rej)
                         }).catch(e => {
                              console.warn(`${e}`)
                              return interaction.createFollowup(...opt).then(o => {
                                   interaction.getOriginal().then(o2 => {
                                        o2.edit = (...content) => editReply(...content)
                                        res(o2)
                                   }).catch(rej)
                              }).catch(rej)
                         })
                    } else {
                         return interaction.createMessage(...opt).then(o => {
                              interaction.getOriginal().then(o2 => {
                                   o2.edit = (...content) => editReply(...content)
                                   res(o2)
                              }).catch(rej)
                         }).catch(e => {
                              console.warn(`${e}`)
                              if(`${e}`.toLowerCase().includes(`already been acknowledged`)) {
                                   return interaction.editOriginal(...opt).then(o => {
                                        interaction.getOriginal().then(o2 => {
                                             o2.edit = (...content) => editReply(...content)
                                             res(o2)
                                        }).catch(rej)
                                   }).catch(rej)
                              } else rej(e)
                         })
                    }
               }
          })
     }

     interaction.channel.createMessage = (...opt) => ctx.utils.createMessage(ctx, interaction, false, ...opt);

     if(!interaction.channel.guild.guildSetting) await ctx.utils.lookupGuild(ctx, interaction.channel.guild.id);
     if(!interaction.channel.guild.guildSetting) console.w(`I CAN'T FIND A GUILD WAAAA (id ${interaction.channel.guild.id}; name ${interaction.channel.guild.name})`);

     interaction.content = `/${interaction.data.name || interaction.data.customID.split(`-`)[0]} ${args.join(` `)}`;

     interaction.prefix = `/`;

     interaction.author = ctx.bot.users.get(interaction.member.id);

     interaction.attachments = attachments
     
     core.runCommandThing(ctx, interaction, true);

     console.d(`sent to command handler!`)
}
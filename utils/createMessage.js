module.exports = async (ctx, msg, attachRef, ...content) => new Promise(async (res, rej) => {
     const origChannel = ctx.bot.getChannel(msg.channel.id);
     let addRef = false;

     //console.log(content)

     if(content[0] && content[0].embed) {
          console.d(`Message object has classic "embed property"...`)
          if(content[0].embeds) {
               console.d(`Appending embed property to existing embeds array!`)
               content[0].embeds.push(content[0].embed);
          } else {
               console.d(`Creating embeds array!`)
               content[0].embeds = [content[0].embed]
          }
          delete content[0].embed;
     };

     //const chance = Math.round(Math.random()*14);
     const chance = -1

     if(ctx.cache.referencedMessages.find(i => i == msg.id) && msg.channel.messages.has(ctx.cache.referencedMessages.find(i => i == msg.id))) {
          const cid = ctx.cache.referencedMessages.find(i => i == msg.id)
          let m = msg.channel.messages.find(ms => ms && ms.messageReference && ms.messageReference.messageID == cid);
          if(m && m.id && m.edit) {
               if(m.content !== typeof content[0] == `object` ? content[0].content : content[0]) {
                    m = await m.edit(...content)
               }; res(m)
          } else {
               try { msg.channel.messages.delete(ctx.cache.referencedMessages.find(i => i == msg.id)) } catch(e) {};
               utils.createMessage(ctx, msg, attachRef, ...content).then(res).catch(rej);
          }
     } else {
          if(typeof attachRef == `string`) {
               addRef = (typeof attachRef == `string` && !isNaN(Number(attachRef)) ? attachRef : false)
          } else {
               addRef = (attachRef && !ctx.cache.referencedMessages.find(i => i == msg.id) ? true : false);
          }; if(addRef) {ctx.cache.referencedMessages.push(msg.id)}
          console.d(`raw createMessage on ${msg.id}: ${typeof content[0] == `object` ? `${JSON.stringify(content[0])}` : content[0]}`)
          const stack = new Error().stack.replace(`Error\n`, ``).replace(/    at /g, `| `).split(`\n`).filter(l => l.includes(`/nyx/`)).join(`\n`)
          console.d(`createMessage called on message ID ${msg.id}, channel ID ${msg.channel.id}, guild ID ${msg.channel.guild.id}, from original author of ${msg.author.id} (${msg.author.username}#${msg.author.discriminator}), with content[0] being ${content[0] ? `${typeof content[0] == `string` || typeof content[0].content == `string` ? `"${(content[0].content || content[0]).replace('\n', '\\n')}"` : `an object, ${typeof content[0].embed == `object` && typeof content[0].embed.title == `string` ? `specifically an embed with the title "${content[0].embed.title.replace('\n', '\\n')}"${content[0].embed.description ? ` and description being ${content[0].embed.description.replace('\n', '\\n')}` : ``}` : `not being an embed.`}`}` : `... nonexistent. ..`}`, stack);
          if(typeof content[0].embed == `object`) console.d(content[0].embed)
          if(typeof content[0] == `string` || (typeof content[0] == `object` && Object.keys(content[0]).length === 1 && typeof content[0].content == `string`)) {
               if(content[0].content) content[0] = content[0].content;
               if(chance === 4 && ctx.discordInteractionObject.find(o => o.name.toString().toLowerCase() == `${msg.cmd}`.toLowerCase()) !== undefined && !msg.data) content[0] = content[0] + `\n\n**Note:** Nyx v2 has migrated to slash commands! In the near future, the legacy command system will be removed, and slash commands will become the primary method of interaction!\n\nIf you are unable to use my slash commands, just re-invite me from my website! (<https://nyx.bot/i>) This will not affect any configurations of the server, it only adds the newest permission scope \`applications.commands\` which will allow me to provide the commands for this server!`
               if(msg.channel.guild.guildSetting.owomode) {content[0] = ctx.utils.owoify(content[0])};
               if(addRef) {content[0] = {content: content[0], messageReference: {messageID: msg.id, failIfNotExists: false}}}
               if(addRef && origChannel.messages.has(msg.id)) {
                    ctx.bot.rest.channels.createMessage(msg.channel.id, ...content).then(r => {
                         r.edit = (...content) => utils.editMessage(ctx, r, ...content)
                         res(r)
                    }).catch(async e => {
                         if(`${e}`.toLowerCase().includes(`unknown message`)) {
                              content[0] = {content: content[0].content}
                              ctx.bot.rest.channels.createMessage(msg.channel.id, ...content).then(r => {
                                   r.edit = (...content) => utils.editMessage(ctx, r, ...content)
                                   res(r)
                              }).catch(rej)
                         } else rej(e)
                    })
               } else {
                    ctx.bot.rest.channels.createMessage(msg.channel.id, {content: content[0]}, ...content.slice(1)).then(r => {
                         r.edit = (...content) => utils.editMessage(ctx, r, ...content)
                         res(r)
                    }).catch(rej)
               }
          } else if(typeof content[0] == `object`) {
               if(addRef) {content[0].messageReference = {messageID: msg.id, failIfNotExists: false};}
               if(!msg.channel.permissionsOf || (msg.channel.permissionsOf(ctx.bot.user.id).has(`SEND_MESSAGES`) && msg.channel.permissionsOf(ctx.bot.user.id).has(`EMBED_LINKS`))) {
                    if(msg.channel.guild.guildSetting.owomode && content[0].content) {content[0].content = ctx.utils.owoify(content[0].content)};
                    if(chance === 4 && ctx.discordInteractionObject.find(o => o.name.toString().toLowerCase() == `${msg.cmd}`.toLowerCase()) !== undefined && !msg.data) {
                         if(content[0].content) {
                              content[0].content = content[0].content + `\n\n**Note:** Nyx v2 has migrated to slash commands! In the near future, the legacy command system will be removed, and slash commands will become the primary method of interaction!\n\nIf you are unable to use my slash commands, just re-invite me from my website! (<https://nyx.bot/i>) This will not affect any configurations of the server, it only adds the newest permission scope \`applications.commands\` which will allow me to provide the commands for this server!`
                         } else {
                              content[0].content = `**Note:** Nyx v2 has migrated to slash commands! In the near future, the legacy command system will be removed, and slash commands will become the primary method of interaction!\n\nIf you are unable to use my slash commands, just re-invite me from my website! (<https://nyx.bot/i>) This will not affect any configurations of the server, it only adds the newest permission scope \`applications.commands\` which will allow me to provide the commands for this server!`
                         }
                    }
                    if(msg.channel.guild.guildSetting.owomode && content[0].embed) {
                         const a = Object.keys(content[0].embed);
                         a.forEach(key => {
                              if((key != `fields` || key != `color` || key != `footer` || key != `fields`) && typeof content[0].embed[key] == `string`) {
                                   const t = ctx.utils.owoify(content[0].embed[key])
                                   content[0].embed[key] = t;
                              } else if(key == `fields` && content[0].embed[key].forEach) {
                                   for(i in content[0].embed.fields) {
                                        const obj = content[0].embed.fields[i]
                                        obj.name = ctx.utils.owoify(obj.name)
                                        obj.value = ctx.utils.owoify(obj.value)
                                   }
                              } else if(key == `footer` && content[0].embed.footer.text) {
                                   content[0].embed.footer.text = ctx.utils.owoify(content[0].embed.footer.text);
                              }
                         });
                    }
                    if(addRef && origChannel.messages.has(msg.id)) {
                         //console.log(require('util').inspect(content, false, 5))
                         ctx.bot.rest.channels.createMessage(msg.channel.id, ...content).then(r => {
                              r.edit = (...content) => utils.editMessage(ctx, r, ...content);
                              r.reply = (...content) => utils.createMessage(ctx, r, true, ...content);
                              res(r)
                         }).catch(async e => {
                              if(`${e}`.toLowerCase().includes(`unknown message`)) {
                                   delete content[0].messageReference
                                   ctx.bot.rest.channels.createMessage(msg.channel.id, ...content).then(r => {
                                        r.edit = (...content) => utils.editMessage(ctx, r, ...content)
                                        r.reply = (...content) => utils.createMessage(ctx, r, true, ...content);
                                        res(r)
                                   }).catch(rej)
                              } else rej(e)
                         })
                    } else {
                         //console.log(require('util').inspect(content, false, 5))
                         ctx.bot.rest.channels.createMessage(msg.channel.id, ...content).then(r => {
                              r.edit = (...content) => utils.editMessage(ctx, r, ...content)
                              r.reply = (...content) => utils.createMessage(ctx, r, true, ...content);
                              res(r)
                         }).catch(rej)
                    }
               } else {
                    if(addRef && origChannel.messages.has(msg.id)) {
                         ctx.bot.rest.channels.createMessage(msg.channel.id, `${ctx.fail} **Please allow me to send embedded links to this channel!**`).then(r => {
                              r.edit = (...content) => utils.editMessage(ctx, r, ...content)
                              r.reply = (...content) => utils.createMessage(ctx, r, true, ...content);
                              res(r)
                         }).catch(async e => {
                              if(`${e}`.toLowerCase().includes(`unknown message`)) {
                                   delete content[0].messageReference
                                   ctx.bot.rest.channels.createMessage(msg.channel.id, ...content).then(r => {
                                        r.edit = (...content) => utils.editMessage(ctx, r, ...content)
                                        r.reply = (...content) => utils.createMessage(ctx, r, true, ...content);
                                        res(r)
                                   }).catch(rej)
                              } else rej(e)
                         })
                    } else {
                         ctx.bot.rest.channels.createMessage(msg.channel.id, `${ctx.fail} **Please allow me to send embedded links to this channel!**`).then(r => {
                              r.edit = (...content) => utils.editMessage(ctx, r, ...content)
                              res(r)
                         }).catch(rej)
                    }
               }
          }
     }
})
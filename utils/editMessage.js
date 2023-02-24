module.exports = async (ctx, msg, ...content) => new Promise(async (res, rej) => {
     console.d(`raw editMessage on ${msg.id}: ${typeof content[0] == `object` ? `${JSON.stringify(content[0])}` : content[0]}`)
     const stack = new Error().stack.replace(`Error\n`, ``).replace(/    at /g, `| `).split(`\n`).filter(l => l.includes(`/nyx/`)).join(`\n`)
     console.d(`editMessage called on message ID ${msg.id}, channel ID ${msg.channel.id}, guild ID ${msg.channel.guild.id}, with content[0] being ${content[0] ? `${typeof content[0] == `string` || typeof content[0].content == `string` ? `"${(content[0].content || content[0]).replace('\n', '\\n')}"` : `an object, ${typeof content[0].embed == `object` && typeof content[0].embed.title == `string` ? `specifically an embed with the title "${content[0].embed.title.replace('\n', '\\n')}"${content[0].embed.description ? ` and description being ${content[0].embed.description.replace('\n', '\\n')}` : ``}` : `not being an embed.`}`}` : `... nonexistent. ..`}`, stack);
     if(typeof content[0].embed == `object`) console.d(content[0].embed)

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
     }

     if(typeof content[0] == `string` || (typeof content[0] == `object` && Object.keys(content[0]).length === 1 && typeof content[0].content == `string`)) {
          if(content[0].content) content[0] = content[0].content;
          if(msg.channel.guild.guildSetting.owomode) {content[0] = ctx.utils.owoify(content[0])};
          if(`${msg.content}`.includes(`Nyx v2 has migrated to slash commands`)) content[0] = content[0] + `\n\n**Note:** Nyx v2 has migrated to slash commands! In the near future, the legacy command system will be removed, and slash commands will become the primary method of interaction!\n\nIf you are unable to use my slash commands, just re-invite me from my website! (<https://nyx.bot/i>) This will not affect any configurations of the server, it only adds the newest permission scope \`applications.commands\` which will allow me to provide the commands for this server!`
          ctx.bot.rest.channels.editMessage(msg.channel.id, msg.id, {content: content[0]}, ...content.slice(1)).then(r => {
               r.edit = (...content) => utils.editMessage(ctx, r, ...content)
               res(r)
          }).catch(rej)
     } else if(typeof content[0] == `object`) {
          if(content[0] && content[0].embed && typeof content[0].embed.color == `string`) content[0].embed.color = utils.colors(content[0].embed.color)
          if(!msg.channel.permissionsOf || msg.channel.permissionsOf(ctx.bot.user.id).has(`SEND_MESSAGES`) && msg.channel.permissionsOf(ctx.bot.user.id).has(`EMBED_LINKS`)) {
               if(msg.channel.guild.guildSetting.owomode && content[0].content) {content[0].content = ctx.utils.owoify(content[0].content)};
               if(`${msg.content}`.includes(`Nyx v2 will be getting an update soon`)) {
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
               ctx.bot.rest.channels.editMessage(msg.channel.id, msg.id, ...content).then(r => {
                    r.edit = (...content) => utils.editMessage(ctx, r, ...content)
                    res(r)
               }).catch(rej);
          } else {
               return ctx.bot.rest.channels.editMessage(msg.channel.id, msg.id, `${ctx.fail} **I was unable to update this message, because I don't have permission to send embedded links in this channel!**`).then(r => {
                    r.edit = (...content) => utils.editMessage(ctx, r, ...content)
                    res(r)
               }).catch(rej);
          }
     }
})
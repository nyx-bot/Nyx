module.exports = async (ctx, msg, isInteraction) => {
     try {
          if(msg.channel.type === 1) {
               let attachments = [];
               msg.attachments.forEach(a => {
                    let str = [];
                    if(a.width && a.height) {str.push(`[${a.width}x${a.height}]`)};
                    if(a.filename) {str.push(`"${a.filename}"`)};
                    str.push(a.url);
                    if(str.length !== 0) {attachments.push(str.join(' '))}
               })
               console.l(`[DM] ${msg.author.username}#${msg.author.discriminator} (${msg.author.id}): ${msg.content}${attachments.length !== 0 ? `\n| ${attachments.join('\n| ')}` : ``}`)
          } else if(msg.author && msg.channel && msg.channel.guild && !ctx.ignoreAllMessages) {
               msg.channel.guild.me = msg.channel.guild.members.get(ctx.bot.user.id)
               let hasRan = false;
               if(msg.channel.guild) if(!ctx.cache.msgsPerHour[msg.channel.guild.id]) {ctx.cache.msgsPerHour[msg.channel.guild.id] = 0};
               if(msg.channel.guild) ctx.cache.msgsPerHour[msg.channel.guild.id]++;
               setTimeout(() => {
                    if(typeof ctx.cache.msgsPerHour[msg.channel.guild.id] == `number`) {
                         ctx.cache.msgsPerHour[msg.channel.guild.id]--;
                         if(ctx.cache.msgsPerHour[msg.channel.guild.id] === 0) {delete ctx.cache.msgsPerHour[msg.channel.guild.id]}
                    }
               }, 3.6e+6)
               msg.beginProcess = Date.now();
               if(msg.author.id == ctx.bot.user.id || msg.author.bot) return;
               let potentialCmd;
               try {
                    potentialCmd = (msg.content.split(' ')[0].match(/^(<(@!|@|@&)\d{17,18}>|nyx)$/i) ? msg.content.split(' ').slice(1)[0] : msg.content.split(' ')[0]).toLowerCase().split('').reverse().join('').split(/[^a-zA-Z]/)[0].split('').reverse().join('');
               } catch(e) {}
               if(!msg.channel.guild.guildSetting) await ctx.utils.lookupGuild(ctx, msg.channel.guild.id);
               if(!msg.channel.guild.guildSetting) return console.w(`I CAN'T FIND A GUILD WAAAA (id ${guild.id}; name ${guild.name})`);
               let prefix = msg.prefix || msg.channel.guild.guildSetting.prefix;
               let prefix2 = `<@!${ctx.bot.user.id}> `, p2changed = false;
               let toRun = false;
               let content = msg.content;
     
               if(isInteraction) {
                    toRun = true;
               } else if(content.toLowerCase().startsWith(prefix.toLowerCase())) {
                    toRun = true;
               } else if(content.startsWith(prefix2)) {
                    toRun = true;
                    content = content.replace(prefix2, prefix);
               } else {
                    p2changed = true;
                    prefix2 = `<@${ctx.bot.user.id}> `;
                    if(content.startsWith(prefix2)) {
                         toRun = true;
                         content = content.replace(prefix2, prefix);
                    } else {
                         prefix2 = `nyx `;
                         if(content.toLowerCase().startsWith(prefix2)) {
                              toRun = true;
                              content = `${prefix}${content.slice(4)}`
                         } else {
                              prefix2 = `nyx`;
                              if(content.toLowerCase().startsWith(prefix2)) {
                                   toRun = true;
                                   content = `${prefix}${content.slice(3)}`
                              } else if(potentialCmd) {
                                   const c = ctx.cmds.get(ctx.aliases.get(potentialCmd) || potentialCmd);
                                   if(c) {
                                        console.d(`POTENTIAL COMMAND, BUT DID NOT PASS PREFIXES:\n- first arg: ${potentialCmd}\n- command found: ${c.name}\n- guild prefix: ${prefix}\n- message content: ${msg.content}`)
                                   }
                              }
                         }
                    }
               }; if(toRun) {
                    if(!ctx.commandsRan) ctx.commandsRan = 0;
                    ctx.commandsRan++;

                    console.d(`Potential command; passed prefix with:\n- guild prefix as ${prefix}${p2changed ? `\n- prefix2 is left at ${prefix2}.` : ``}\n- content is ${content}\n- raw content is ${msg.content}`)
          
                    while(content.includes(`  `)) content = content.replace(/  /g, ' ').replace(/  /g, ' ');
     
                    let [cmd, ...args] = content.split(" ");
     
                    let largs = args.map(a => a.toLowerCase());
     
                    if((ctx.elevated.find(a => a == msg.author.id) && args.find(a => a == `--user`))) {
                         const pos = args.indexOf(`--user`);
                         args.splice(pos, 1)
                         const u = args[pos];
                         if(!isNaN(u) && ctx.bot.users.has(u) && msg.channel.guild.members.has(u)) {
                              args.splice(pos, 1)
                              msg.author = ctx.bot.users.get(u)
                              msg.member = msg.channel.guild.members.get(u)
                         }
                    } else if((ctx.elevated.find(a => a == msg.author.id) && args.find(a => a == `-u`))) {
                         const pos = args.indexOf(`-u`);
                         args.splice(pos, 1)
                         const u = args[pos];
                         if(!isNaN(u) && ctx.bot.users.has(u) && msg.channel.guild.members.has(u)) {
                              args.splice(pos, 1)
                              msg.author = ctx.bot.users.get(u)
                              msg.member = msg.channel.guild.members.get(u)
                         }
                    }
          
                    cmd = (typeof msg.data == `object` && msg.data.name ? msg.data.name : cmd.replace(prefix, "").toLowerCase());
          
                    msg.prefix = prefix;
                    const c = ctx.cmds.get(ctx.aliases.get(cmd) || cmd);
                    
                    if(c && toRun) {
                         msg.cmd = c.name;
                         console.d(`same potential command found command object ${c.name}.`)
                         const disabled = await ctx.utils.disabledCmds.status(ctx, msg.channel.guild.id, c.name);
                         console.l(
                              `${disabled ? `[X] ` : ``}${msg.channel.guild.name} (${msg.channel.guild.id}): ${
                                   msg.author.username + "#" + msg.author.discriminator
                              } (${msg.author.id}):${msg.attachments.size !== 0 ? ` [${msg.attachments.size} attachment${msg.attachments.size === 1 ? `` : `s`}]` : ``} ${cmd} ${args.join(' ')}`
                         );
                         if(disabled === false) {
                              //console.debugLog(JSON.stringify(c))
                              if(
                                   msg.channel.guild.guildSetting &&
                                   msg.channel.guild.guildSetting[c.group] !== undefined
                              ) {
                                   if(!msg.channel.guild.guildSetting[c.group]) {
                                        if(isInteraction) {
                                             return msg.reply({
                                                  content: `${ctx.fail} The module of this command (${c.group}) is disabled in this server!`,
                                                  flags: 64,
                                             })
                                        } else return; 
                                   }
                              }
                              if(c.permission !== undefined && !msg.channel.guild.makeShift) {
                                   if((ctx.elevated.find(a => a == msg.author.id) && args.find(a => a == `--sudo`))) {args.splice(args.indexOf(`--sudo`), 1)} else {
                                        const permissionCheck = await ctx.utils.hasPermission(
                                             ctx,
                                             msg.author.id,
                                             msg.channel.guild.id,
                                             c.permission
                                        );
                                        if(permissionCheck.result === false) {
                                             return msg.reply(
                                                  `<:NyxCross:942164350683189339> You don't have permission to use this command! (Missing: "${permissionCheck.permissionNeeded}")`
                                             );
                                        }
                                   }
                              }
                              if(
                                   c.guild &&
                                   !msg.channel.guild.makeShift &&
                                   msg.channel.guild &&
                                   !c.guild.includes(msg.channel.guild.id)
                              ) return;
                              hasRan = true;
                              msg.hasRan = true;
                              const getTimeMax = async (ctx, id) => {
                                  const usr = await ctx.utils.lookupUser(ctx, id);
                                                       // 5 hrs    2 hrs
                                  return (usr.supporter ? 4.32e+7 : 7.2e+6)
                              };
                              msg.author.maxtime = await getTimeMax(ctx, msg.author.id)
                              msg.args = args;
                              if(c.group && c.group == `music` && ctx.music[msg.channel.guild.id]) {
                                   ctx.music[msg.channel.guild.id].lastChannel = msg.channel;
                                   if(ctx.music[msg.channel.guild.id].finalEndCalled) {
                                        let called = false;
                                        ctx.music[msg.channel.guild.id].eventEmitter.once('gone', () => {if(!called) {called = true; c.func(ctx, msg, args)}});
                                        setTimeout(() => {
                                             if(!called) {called = true; c.func(ctx, msg, args, largs)}
                                        }, 3000)
                                   } else c.func(ctx, msg, args, largs)
                              } else c.func(ctx, msg, args, largs)
                         } else {
                              console.d(`${c.name} IS DISABLED FOR ${msg.channel.guild.name}`);
                              if(isInteraction) msg.reply({
                                   content: `${ctx.fail} This command has been disabled in this server!`,
                                   flags: 64,
                              })
                         }
                    } else if(!c) {
                         console.d(`same potential command could NOT find anything.\n- cmd set as ${cmd}`)
                    }
               }
               if(!hasRan) {
                    if(msg.mentions.members.length !== 0 && msg.channel.permissionsOf(ctx.bot.user.id).has(`SEND_MESSAGES`) && msg.channel.permissionsOf(ctx.bot.user.id).has(`EMBED_LINKS`)) {
                         let sent = 0;
                         for (i in msg.mentions.members) {
                              let user = msg.mentions.members[i]
                              if(user && user.id) {
                                   const afk = await ctx.utils.afk.get(ctx, user.id);
                                   if(afk !== null && sent !== 2) {
                                        let embd = {
                                             title: `${user.username} is AFK!`,
                                             description: `${afk.message}`,
                                             color: ctx.utils.colors('random'),
                                             footer: {text: `${(await ctx.utils.timeConvert(Date.now() - afk.time))} ago.`}
                                        };
                                        await msg.reply({embeds: [embd], messageReference: {messageID: msg.id, failIfNotExists: false}})
                                        sent++;
                                   }
                              }
                         }
                    }
               }
          }
     } catch(e) {
          console.de(`Failed to run command: ${e}`, e.stack)
     }
}
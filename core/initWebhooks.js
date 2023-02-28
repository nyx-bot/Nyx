const fs = require('fs')

module.exports = (ctx) => new Promise(async(resolve, rej) => {
     core.boxLog(`┃ Initiating Webhooks`);
     const app = require('express')();

     app.use(async (req, res, next) => {
          console.d(`ENDPOINT REQUESTED: ${req.path}`)


          const send = res.send;
          res.send = async (content) => {
               let c = content
               if(typeof c == `object`) {
                    c = JSON.stringify(content);
                    res.setHeader(`Content-Type`, `application/json; charset=utf-8`)
               };

               if(typeof c == `string`) {
                    content = c;

                    let index = 0;
                    while(index < content.length) {
                         await ctx.timeout(6);
                         let string = content.substring(index, index+1750);
                         res.write(string);
                         index = index+1750;
                    };
                    res.end();
               } else {
                    send(content)
               }
          };

          next();
     });

     app.get(`/commandList`, async (req, res) => {
          let obj = {};
          for(c of Array.from(ctx.cmds).slice(0)) {
               c = c[1]
               if(ctx.moduleSetting.get(c.group).canView || typeof ctx.moduleSetting.get(c.group).canView == `undefined`) {
                    const module = c.group;
                    if(!obj[module]) obj[module] = [];
                    let permission = `Everyone`
                    if(c.permission === 1) permission = `Server Moderator`
                    if(c.permission === 2) permission = `Server Administrator`
                    if(c.permission === 3) permission = `Server DJ`
                    obj[module].push({
                         name: c.name, 
                         description: c.desc, 
                         permission,
                         usage: c.usage.replace(`;`, `nyx `) || `nyx ` + c.name, 
                         aliases: c.aliases || []
                    });
               };
               await ctx.timeout(20);
          };
          res.send(obj)
     })

     app.get(`/discordCommandList`, async (req, res) => res.send(ctx.rawDiscordInteractionObject || ctx.discordInteractionObject || {
          error: true, 
          message: `No command list has been created yet!`
     }))

     app.get('/allStats', async (req, res) => {
          const listOfFiles = fs.readdirSync(`./stats/`);
          let a = {}
          for(f of listOfFiles) {
               let e = fs.readFileSync(`./stats/${f}`).toString();
               if(e.startsWith('[') && e.endsWith(']')) {
                    try {
                         e = JSON.parse(e);
                         if(f.toLowerCase().includes(`server`)) {
                              if(f.toLowerCase().includes(`minute`)) {
                                   if(e.length > 59) e.shift();
                                   e.push([ctx.libs.moment.utc(Date.now()).format(`h:mmA [UTC]`), ctx.bot.guilds.size])
                              }
                              if(f.toLowerCase().includes(`month`)) {
                                   if(e.length > 11) e.shift();
                                   e.push([ctx.libs.moment.utc(Date.now()).format(`MMMM`), ctx.bot.guilds.size])
                              }
                              if(f.toLowerCase().includes(`daily`)) {
                                   if(e.length > 29) e.shift();
                                   e.push([ctx.libs.moment.utc(Date.now()).format(`MMM Do`), ctx.bot.guilds.size])
                              }
                              if(f.toLowerCase().includes(`hour`)) {
                                   if(e.length > 59) e.shift();
                                   e.push([ctx.libs.moment.utc(Date.now()).format(`hA [UTC]`), ctx.bot.guilds.size])
                              }
                         }
                         a[f.replace('.json', '')] = e;
                    } catch(e) {}
               }
               await ctx.timeout(25);
          };
          res.send(a)
     })

     app.get('/getServer/:id', (req, res) => {
          if(ctx.bot.guilds.get(req.params.id)) {
               console.l(`┃ Name requested for server ${req.params.id} [${ctx.bot.guilds.get(req.params.id).name}]`)
               return res.send({name: `${ctx.bot.guilds.get(req.params.id).name}`})
          } else {
               console.l(`┃ Name requested for server ${req.params.id}, but I was unable to find that guild.`)
               return res.send({name: `(unknown)`})
          }
     });

     app.get('/status', async (req, res) => {
          const v = Object.entries(ctx.connectionErrHandling);
          let arr = [];
          const music = Object.values(ctx.music)
          for(i in v) {
               const shard = {}, s = v[i][1];
               shard.id = Number(v[i][0].replace('shard', ''))
               Object.entries(s).forEach(sh => shard[sh[0]] = sh[1]);
               const botShard = ctx.bot.shards.get(shard.id)
               shard[`api latency`] = botShard.latency
               shard[`online for`] = await ctx.utils.timeConvert(Date.now() - ctx.shardConnectedTime[`${botShard.id}`]);
               shard[`playing music in`] = `${music.filter(o => o.lastChannel.guild.shard.id === shard.id).length} servers`;
               shard[`handling`] = `${Object.values(ctx.bot.guildShardMap).filter(o => o === shard.id).length} servers`
               arr.push(shard)
               await ctx.timeout(10)
          }
          res.send(arr)
     })

     app.get('/stats', (req, res) => res.send({
          servers: ctx.bot.guilds.size,
          users: ctx.bot.guilds.reduce((a, b) => a + b.memberCount, 0),
          connections: Object.keys(ctx.music).filter(a => !isNaN(a)).length,
          shards: ctx.bot.shards.size,
          serversPerShard: ctx.bot.shards.map(s => ctx.bot.guilds.filter(g => g.shard.id == s.id).length)
     }));

     app.get(`/background/:id`, require('express').json(), async (req, res) => {
          fs.readdir(__dirname.split(`/`).slice(0, -1).join(`/`) + `/etc/backgrounds/`, async (e, ids) => {
               if(e) {
                    res.status(500).send({
                         error: true,
                         message: e.toString()
                    })
               } else {
                    const thisServer = ids.find(i => i.startsWith(req.params.id))
                    if(thisServer) {
                         res.sendFile(__dirname.split(`/`).slice(0, -1).join(`/`) + `/etc/backgrounds/${thisServer}`)
                    } else {
                         res.status(404).send({
                              error: true,
                              message: `Doesn't exist!`
                         })
                    }
               }
          })
     })

     function name(ctx, id) {
          const u = ctx.bot.users.get(id);
          if(u) {return `${u.username}#${u.discriminator}`} else {return null;}
     };

     /*app.post('/set/:id/:uid', require('express').json(), async (req, res) => {
          let fail = false;
          const uid = req.params.uid, id = req.params.id, guild = (ctx.bot.guilds.get(id))
          let name;
          if(ctx.bot.users.get(uid)) {
               name = `${ctx.bot.users.get(uid).username}#${ctx.bot.users.get(uid).discriminator}`
          } else {
               name = uid
          }; let perm;
          if(guild && (guild.ownerID == uid || ctx.elevated.find(iiid => iiid == uid))) {perm = true} else if(guild) {
               ajfjfjf = await ctx.utils.hasPermission(ctx, uid, id, `admin`, true).catch(e => {perm = false;});
               if(!perm) {perm = ajfjfjf.result}
          }
          if(!fail && guild && perm) {
               let a = Object.keys(req.body)[0];
               console.l(`┃ SET method requested for user ${name}: ${a}`)
               if(a == `setprefix`) {
                    if(unescape(req.body.setprefix).length > 15) return res.send({error: true, message: `Prefixes cannot be longer than 15 characters!`})
                    let guildSetting = await ctx.utils.lookupGuildOrCreate(ctx, id);
                    const oldPrefix = `${guildSetting.dataValues.prefix}`;
                    await guildSetting.update({prefix: unescape(req.body.setprefix)}, {
                    where: {
                         id
                    }
                    });
                    guildSetting.save().then(res => res.toJSON()).then(async resp => {
                         await ctx.utils.createLog(ctx, uid, id, uid, `Edited through Web Dashboard`, a, null, JSON.stringify({
                              "Old Prefix": oldPrefix,
                              "New Prefix": resp.prefix,
                         }), 2)
                    return res.send({error: false, message: `Set prefix to ${resp.prefix}`})
                    })
               } else if(a == `setnickname`) {
                    if(unescape(req.body.setnickname).length > 32) return res.send({error: true, message: `Nicknames cannot be longer than 32 characters!`});
                    const guild = ctx.bot.guilds.get(id);
                    if(!guild) return res.send({error: true, message: `I was unable to find this guild!`});
                    const me = ctx.bot.guilds.get(id).members.get(ctx.bot.user.id);
                    const oldNick = `${me.nick || me.user.username}`;
                    await ctx.bot.editNickname(id, unescape(req.body.setnickname), `Edited through Web Dashboard by ${name}`).then(async promise => {
                         await ctx.utils.createLog(ctx, uid, id, uid, `Edited through Web Dashboard`, a, null, JSON.stringify({
                              "Old Nickname": oldNick,
                              "New Nickname": unescape(req.body.setnickname)
                         }), 2)
                         return res.send({error: false, message: `Set nickname to ${unescape(req.body.setnickname)}`})
                    }).catch(e => {
                         if(`${e.toLowerCase()}`.includes(`permission`)) {
                              return res.send({error: true, message: `I don't have permission to set my own nickname!`})
                         } else return res.send({error: true, message: `${e}`})
                    });
               } else if(a == `deleteadminrole`) {
                    const guildSetting = await ctx.utils.lookupGuildOrCreate( ctx, id, false );
                    const adminRoles = JSON.parse(guildSetting.dataValues.adminRoles);
                    if(adminRoles.find(r => r == req.body.deleteadminrole)) {
                         let pos = adminRoles.indexOf(req.body.deleteadminrole);
                         const oldrole = adminRoles.splice(pos, 1)
                         let toWrite = JSON.stringify(adminRoles)
                         await guildSetting.update({adminRoles: toWrite}, {
                             where: {
                                 id
                             }
                         });
                         guildSetting.save().then(res => res.toJSON()).then(async response => {
                              await ctx.utils.createLog(ctx, uid, id, uid, `Edited through Web Dashboard`, a, null, JSON.stringify({"Role": oldrole}), 2)
                              return res.send({error: false, message: `Successfully removed role!`})
                         })
                    } else return res.send({error: true, message: `This role is not a Server Administrator role!`})
               } else if(a == `deletemodrole`) {
                    const guildSetting = await ctx.utils.lookupGuildOrCreate( ctx, id, false );
                    const adminRoles = JSON.parse(guildSetting.dataValues.modRoles);
                    if(adminRoles.find(r => r == req.body.deletemodrole)) {
                         let pos = adminRoles.indexOf(req.body.deletemodrole);
                         oldrole = adminRoles.splice(pos, 1)
                         let toWrite = JSON.stringify(adminRoles)
                         await guildSetting.update({modRoles: toWrite}, {
                             where: {
                                 id
                             }
                         });
                         guildSetting.save().then(res => res.toJSON()).then(async response => {
                              await ctx.utils.createLog(ctx, uid, id, uid, `Edited through Web Dashboard`, a, null, JSON.stringify({"Role": oldrole}), 2)
                              return res.send({error: false, message: `Successfully removed role!`})
                         })
                    } else return res.send({error: true, message: `This role is not a Server Moderator role!`})
               } else if(a == `deletemutedrole`) {
                    const guildSetting = await ctx.utils.lookupGuildOrCreate( ctx, id, false );
                    const oldrole = guildSetting.dataValues.muteRole
                    await guildSetting.update({muteRole: null}, {
                        where: {
                            id
                        }
                    });
                    guildSetting.save().then(res => res.toJSON()).then(async response => {
                         await ctx.utils.createLog(ctx, uid, id, uid, `Edited through Web Dashboard`, a, null, JSON.stringify({"Role": oldrole}), 2)
                         return res.send({error: false, message: `Successfully removed role!`})
                    })
               } else if(a == `addadminrole`) {
                    if(!guild.roles.get(req.body.addadminrole)) return res.send({error: true, message: `This role does not exist!`})
                    const guildSetting = await ctx.utils.lookupGuildOrCreate( ctx, id, false );
                    const adminRoles = JSON.parse(guildSetting.dataValues.adminRoles);
                    const modRoles = JSON.parse(guildSetting.dataValues.modRoles);
                    if(!adminRoles.find(r => r == req.body.addadminrole) && !modRoles.find(r => r == req.body.addadminrole)) {
                        adminRoles.push(req.body[a]);
                        let toWrite = JSON.stringify(adminRoles);
                        await guildSetting.update({adminRoles: toWrite}, {
                            where: {
                                id
                            }
                        });
                        guildSetting.save().then(res => res.toJSON()).then(async response => {
                         await ctx.utils.createLog(ctx, uid, id, uid, `Edited through Web Dashboard`, a, null, JSON.stringify({"Role": req.body[a]}), 2)
                            return res.send({error: false, message: `Successfully added role!`})
                        })
                    } else {return res.send({error: true, message: `This role is already a Server Administration/Moderation role!`})}
               } else if(a == `addmodrole`) {
                    if(!guild.roles.get(req.body.addmodrole)) return res.send({error: true, message: `This role does not exist!`})
                    const guildSetting = await ctx.utils.lookupGuildOrCreate( ctx, id, false );
                    const adminRoles = JSON.parse(guildSetting.dataValues.adminRoles);
                    const modRoles = JSON.parse(guildSetting.dataValues.modRoles);
                    if(!adminRoles.find(r => r == req.body.addadminrole) && !modRoles.find(r => r == req.body.addadminrole)) {
                        modRoles.push(req.body[a]);
                        let toWrite = JSON.stringify(modRoles);
                        await guildSetting.update({modRoles: toWrite}, {
                            where: {
                                id
                            }
                        });
                        guildSetting.save().then(res => res.toJSON()).then(async response => {
                         await ctx.utils.createLog(ctx, uid, id, uid, `Edited through Web Dashboard`, a, null, JSON.stringify({"Role": req.body[a]}), 2)
                            return res.send({error: false, message: `Successfully added role!`})
                        })
                    } else {return res.send({error: true, message: `Role is already set somewhere!`})}
               } else if(a == `setmutedrole`) {
                    if(!guild.roles.get(req.body.setmutedrole)) return res.send({error: true, message: `This role does not exist!`})
                    const guildSetting = await ctx.utils.lookupGuildOrCreate( ctx, id, false );
                    await guildSetting.update({muteRole: req.body.setmutedrole}, {
                        where: {
                            id
                        }
                    });
                    guildSetting.save().then(res => res.toJSON()).then(async response => {
                         await ctx.utils.createLog(ctx, uid, id, uid, `Edited through Web Dashboard`, a, null, JSON.stringify({"Role": req.body[a]}), 2)
                         return res.send({error: false, message: `Successfully set role!`})
                    })
               } else return res.send({error: true, message: `I don't know how to do that yet!`});
          } else if(!guild) {return res.send({error: true, message: "I can't find the guild!"})} else return res.send({error: true, message: "You aren't allowed to perform this action!"})
     })

     app.get('/serverlogs/:id', async (req, res) => {
          const id = req.params.id;
          if(ctx.bot.guilds.get(id)) {
               let logs = JSON.stringify(await ctx.utils.getLogs(ctx, undefined, id, undefined, true));
               let index = 0;
               res.setHeader(`Content-Type`, `application/json`)
               while(index < logs.length) {
                    await ctx.timeout(5);
                    let string = logs.substring(index, index+3000);
                    res.write(string);
                    index = index+3000;
               };
               res.end();
          } else res.send([])
     });

     app.post('/members/:id', require('express').json(), async (req, res) => {
          const id = req.params.id, guild = ctx.bot.guilds.get(id)
          if(guild) {
               const idsNeeded = req.body.ids;
               let users = {};
               for(i in idsNeeded) {
                    if(!users[idsNeeded[i]]) {
                         const member = guild.members.get(idsNeeded[i]), user = ctx.bot.users.get(idsNeeded[i]);
                         if(member) {
                              users[member.id] = {
                                   nick: member.nick,
                                   roles: member.roles,
                                   status: member.status,
                                   user: member.user,
                              }
                         } else if(user) {
                              users[user.id] = {
                                   nick: null,
                                   roles: [],
                                   user: user,
                              }
                         }
                    }
               };
               users = JSON.stringify(users);
               res.setHeader(`Content-Type`, `application/json`);
               let index = 0;
               while(index < users.length) {
                    await ctx.timeout(4);
                    let string = users.substring(index, index+3000);
                    res.write(string);
                    index = index+3000;
               }; res.end();
          } else res.send([])
     });

     app.get('/user/:id', async (req, res) => {
          const u = ctx.bot.users.get(req.params.id);
          if(u) {
               const db = await ctx.utils.lookupUser(ctx, u.id, true);
               return res.send({
                    user: u,
                    setting: db,
               })
          } else {
               return res.send({})
          }
     })

     app.get('/server/:uid/:id', async (req, res) => {
          const uid = req.params.uid, id = req.params.id;
          if(ctx.bot.guilds.get(id)) {
               let user;
               if(ctx.bot.users.get(uid)) {
                    u = ctx.bot.users.get(uid)
                    user = `${u.username}#${u.discriminator} (${uid})`
               } else user = uid
               let guildName;
               if(ctx.bot.users.get(id)) {
                    u = ctx.bot.guilds.get(id)
                    guildName = `${u.name} (${id})`
               } else guildName = id
               const query = Object.keys(req.query)
               console.l(`┃ Server info requested for ${user}: ${guildName} [${query.join(', ')}]`);
               const obj = {
                    guild: ctx.bot.guilds.get(id).name,
                    level: null,
               };
               if(ctx.elevated.find(iiid => iiid == uid) || ctx.bot.guilds.get(id).ownerID == uid) {obj.level == `owner`};
               if(!obj.level) {
                    let fail = false;
                    let perm = await ctx.utils.hasPermission(ctx, uid, id, `admin`, true).catch(e => {fail = true;});
                    if(!fail && perm.result) {obj.level = `admin`};
               };
               if(!obj.level) {obj.level = `member`; return res.send(obj)};
               obj.id = id
               obj.memberCount = ctx.bot.guilds.get(id).memberCount;
               recentLogs = (await ctx.utils.getLogs(ctx, undefined, id, undefined, true, `all`))
               if(recentLogs.length > 10) {recentLogs.length = 10};
               if(query.find(a => a == `recentLogs`)) {
                    obj.recentLogs = []
                    for(i in recentLogs) {
                         await ctx.timeout(5)
                         l = recentLogs[i];
                         obj.recentLogs.push({type: l.logType, group: l.group, id: l.logID, meta: l.meta, user: {name: name(ctx, l.userID), id: l.userID}, mod: {name: name(ctx, l.modID), id: l.modID}, reason: l.desc, date: l.createdAt, deleted: l.deleted, duration: l.duration || null})
                    };
               }
               if(query.find(a => a == `roles`)) {obj.roles = (Object.values(JSON.parse(JSON.stringify(ctx.bot.guilds.get(id).roles)))).map(r => [{id: r.id, color: r.color, name: r.name}][0])}
               if(query.find(a => a == `channels`)) {obj.channels = Object.values(JSON.parse(JSON.stringify(ctx.bot.guilds.get(id).channels))).map(r => [{id: r.id, type: r.type, name: r.name, topic: r.topic || null}][0]);}
               if(query.find(a => a == `guildSetting`)) {obj.guildSetting = (await ctx.utils.lookupGuild( ctx, id, true ))}
               obj.me = ctx.bot.guilds.get(id).members.get(ctx.bot.user.id);
               const FuckingGuild = ctx.bot.guilds.get(id)
               obj.guildObj = {
                    icon: FuckingGuild.icon || null,
                    region: FuckingGuild.region || null,
                    ownerID: FuckingGuild.ownerID || null,
                    shard: FuckingGuild.shard || null,
               }
               if(query.find(a => a == `stats`)) {obj.stats = {
                    msgsLastHour: ctx.cache.msgsPerHour[id] || 0,
                    joinLeaves: ctx.cache.joinLeave[id] || [0, 0]
               }}
               return res.send(obj)
          } else return res.send({
               guild: null,
               level: `unavailable`
          })
     });

     app.post('/servers', require('express').json(), async (req, res) => {
          const guilds = req.body.servers, uid = req.body.id;
          let gs = [];
          let user;
          if(ctx.bot.users.get(uid)) {
               u = ctx.bot.users.get(uid)
               user = `${u.username}#${u.discriminator} (${uid})`
          } else user = uid
          console.l(`┃ Server details requested for user ${user}`)
          for(i in guilds) {
               const gu = guilds[i], guild = ctx.bot.guilds.get(gu)
               if(guild && guild.members.get(uid)) {
                    if(guild.ownerID == uid) {gs.push({
                         id: guild.id,
                         name: guild.name,
                         type: `owner`
                    })} else {
                         let fail = false;
                         let perm;
                         perm = await ctx.utils.hasPermission(ctx, uid, guild.id, `admin`).catch(e => {fail = true;});
                         if(!fail && perm.result) {
                              gs.push({
                                   id: guild.id,
                                   name: guild.name,
                                   type: `admin`
                              })
                         } else {
                              gs.push({
                                   id: guild.id,
                                   name: guild.name,
                                   type: `not_admin`
                              })
                         }
                    }
               } else if(!guild) {gs.push({
                    id: gu,
                    name: null,
                    type: `not_found`
               })} else if(guild && !guild.members.get(uid)) {
                    gs.push({
                         id: guild.id,
                         name: guild.name,
                         type: `member_not_found`
                    })
               }
          };
          res.send({guilds: gs, sent: guilds.length, finished: gs.length})
     })*/

     app.use((req, res, next) => {
          let createRespObj = (data, error) => {
               if(typeof data == `string`) {
                    return {
                         error: typeof error == `boolean` ? error : false,
                         message: data,
                    }
               } else {
                    return Object.assign({}, data, {
                         error: typeof error == `boolean` ? error : false
                    })
               }
          }

          res.sendError = (data) => res.send(createRespObj(data, true));

          res.origSend = res.send;
          res.send = (data) => res.origSend(createRespObj(data, false));

          next();
     });

     /*const endpoints = require('fs').readdirSync(`./core/webhookEndpoints`).filter(f => f.endsWith(`.js`));

     for(let endpoint of endpoints) try {
          const e = require(`./webhookEndpoints/${endpoint}`);

          let type = e.type ? app[e.type.toLowerCase()] ? e.type.toLowerCase() : `get` || `get` : `get`

          app[type](e.endpoint, (req, res) => e.func(ctx, req, res));
          console.log(`Added endpoint ${endpoint} at location ${e.endpoint} as a ${type.toUpperCase()} request.`)
     } catch(e) {
          console.warn(`Failed to add endpoint ${endpoint}:`, e)
     }*/

     const server = await app.listen(5000, () => {
          core.boxLog(`┃ Webhooks created! Running on port ${server.address().port}`);
          ctx.server = app
          resolve(server)
     });
})
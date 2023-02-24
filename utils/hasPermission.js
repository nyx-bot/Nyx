module.exports = async function (ctx, usrID, guildID, type, elevatedOverride) {
     return new Promise(async function (resolve, reject) {
          const guildSetting = await ctx.seq.models.Server.findOne({
               where: {id: guildID},
               raw: true,
          });
          let modRoles;
          let adminRoles;
          let serverManagerRoles;
          let djRoles;
          if(guildSetting) {
               modRoles = JSON.parse(guildSetting.modRoles);
               adminRoles = JSON.parse(guildSetting.adminRoles);
               serverManagerRoles = JSON.parse(guildSetting.serverManagerRoles);
               djRoles = JSON.parse(guildSetting.djRoles);
          } else {
               modRoles = [];
               adminRoles = [];
               serverManagerRoles = [];
               djRoles = [];
          }
          try {
               const guild = ctx.bot.guilds.get(guildID);
               if(!guild) return reject(`Invalid Guild`);
               let boolean = false;
               if(guild.sesID) {
                    if(type === 1 || type == `mod` || type == `moderator`) return resolve({
                         result: true,
                         permissionNeeded: `Server Mod`,
                         source: `owner`,
                    });
                    if(type === 2 || type == `admin` || type == `administrator`) return resolve({
                         result: true,
                         permissionNeeded: `Server Admin`,
                         source: `owner`,
                    });
               } else {
                    const member = guild.members.get(usrID)
                    if(!member) return reject(`Can't find Member.`);
                    const perms = member.permissions.json;
                    if(type === 1 || type == `mod` || type == `moderator`) {
                         if(guild.ownerID == member.id) {
                              return resolve({
                                   result: true,
                                   permissionNeeded: `Server Mod`,
                                   source: `owner`,
                              });
                         }; if(elevatedOverride && ctx.elevated.find(uuu => uuu == member.id)) {
                              return resolve({
                                   result: true,
                                   permissionNeeded: `Server Mod`,
                                   source: `elevated`,
                              });
                         }
                         if(adminRoles.length !== 0) {
                              let boolean = false;
                              adminRoles.forEach((modRole) => {
                                   if(
                                        member.roles.find((role) => role == modRole)
                                   ) {
                                        boolean = true;
                                   }
                              });
                              if(boolean) {
                                   return resolve({
                                        result: true,
                                        permissionNeeded: `Server Mod`,
                                        source: `adminRole`,
                                   });
                              }
                         }; if(modRoles.length !== 0) {
                              let boolean = false;
                              modRoles.forEach((modRole) => {
                                   if(
                                        member.roles.find((role) => role == modRole)
                                   ) {
                                        boolean = true;
                                   }
                              });
                              if(boolean) {
                                   return resolve({
                                        result: true,
                                        permissionNeeded: `Server Mod`,
                                        source: `modRole`,
                                   });
                              } else {
                                   return resolve({
                                        result: false,
                                        permissionNeeded: `Server Mod`,
                                        source: `modRole`,
                                   });
                              }
                         } else if(
                              perms.kickMembers ||
                              perms.banMembers || 
                              perms.manageGuild || 
                              perms.administrator ||
                              perms.all
                         ) {
                              return resolve({
                                   result: true,
                                   permissionNeeded: `Server Mod`,
                                   source: `permissions`,
                              });
                         } else {
                              return resolve({
                                   result: false,
                                   permissionNeeded: `Server Mod`,
                                   source: `permissions`,
                              });
                         }
                    } else if(type === 2 || type == "adm" || type == "admin") {
                         if(guild.ownerID == member.id) {
                              return resolve({
                                   result: true,
                                   permissionNeeded: `Server Admin`,
                                   source: `owner`,
                              });
                         }; if(elevatedOverride && ctx.elevated.find(uuu => uuu == member.id)) {
                              return resolve({
                                   result: true,
                                   permissionNeeded: `Server Admin`,
                                   source: `elevated`,
                              });
                         }
                         if(adminRoles.length !== 0) {
                              let boolean = false;
                              adminRoles.forEach((modRole) => {
                                   if(
                                        member.roles.find((role) => role == modRole)
                                   ) {
                                        boolean = true;
                                   }
                              });
                              if(boolean) {
                                   return resolve({
                                        result: true,
                                        permissionNeeded: `Server Admin`,
                                        source: `adminRole`,
                                   });
                              } else {
                                   return resolve({
                                        result: false,
                                        permissionNeeded: `Server Admin`,
                                        source: `adminRole`,
                                   });
                              }
                         } else if(
                              perms.banMembers ||
                              perms.administrator ||
                              perms.manageGuild || 
                              perms.all
                         ) {
                              return resolve({
                                   result: true,
                                   permissionNeeded: `Server Admin`,
                                   source: `permissions`,
                              });
                         } else {
                              return resolve({
                                   result: false,
                                   permissionNeeded: `Server Admin`,
                                   source: `permissions`,
                              });
                         }
                    } else if(type === 3 || type == 'music') {
                         if(djRoles.length !== 0) {
                              let boolean = false;
                              djRoles.forEach((modRole) => {
                                   if(
                                        member.roles.find((role) => role == modRole)
                                   ) {
                                        boolean = true;
                                   }
                              });
                              if(boolean) {
                                   return resolve({
                                        result: true,
                                        permissionNeeded: `Server DJ`,
                                        source: `djRole`,
                                   })
                              }
                         }; if(!ctx.music[guildID] || !ctx.music[guildID].channel) {
                              console.d(`${guildID} - ${usrID} (${member.username}) is not playing music, redirect to lvl 1 or MOD.`)
                              ctx.utils.hasPermission(ctx, usrID, guildID, 1, elevatedOverride).then(resolve).catch(reject)
                         } else {
                              console.d(`${guildID} - ${usrID} (${member.username}) is playing music, time to check shit`)
                              const n = ctx.music[guildID].channel.voiceMembers.filter(m => m.id !== ctx.bot.user.id).length;
                              if(n == 1) {console.d(`${guildID} - ${usrID} (${member.username}) is the only one in the voice channel for music, they have "mod perms" for music`); return resolve({
                                   result: true,
                                   permissionNeeded: `Server Mod`,
                                   source: `solomusic`,
                              })} else {console.d(`${guildID} - ${usrID} (${member.username}) is playing music, but is not the only one there. redirect to lvl 1 or MOD.`); ctx.utils.hasPermission(ctx, usrID, guildID, 1, elevatedOverride).then(resolve).catch(reject)}
                         }
                    } else {
                         return reject(`Types range from 1-2, mod to admin.`);
                    }
               }
          } catch (err) {
               reject(err);
          }
     });
}
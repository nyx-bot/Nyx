const fs = require('fs')

module.exports = async function (ctx) {
     return new Promise(async (res, rej) => {
          const Eris = require('oceanic.js')
          var files = fs.readdirSync("./modules/");

          let commandsMade = 0;
          ctx.cmdsObject = {};
          ctx.groups = {array: []};
          ctx.cmds = new Eris.Collection();
          ctx.aliases = new Eris.Collection();
          ctx.moduleSetting = new Map();
          ctx.modules = new Eris.Collection();
          ctx.discordInteractionObject = [];

          for(let module of files) {
               let moduleCommands = fs.readdirSync(`./modules/${module}/`).filter(f => f.endsWith(`.js`));

               if(fs.existsSync(`./modules/${module}/module.json`)) {
                    let a = require(`../modules/${module}/module.json`);
                    
                    ctx.moduleSetting.set(module, a);
                    if(a.canSet === false || a.canSet === undefined) {
                    } else {
                         ctx.groups[module] = [];
                         ctx.groups.array.push(module);
                         ctx.modules.set(module, a);
                    }
               }

               for(let file of moduleCommands) {
                    let a = require(`../modules/${module}/${file}`);

                    if(!ctx.cmdsObject[module]) {
                         ctx.cmdsObject[module] = {
                              commands: {},
                         };
                    };

                    if(a.func && a.name) {
                         if(typeof a.interactionObject == `object`) {
                              let obj = a.interactionObject;
                              obj.name = a.name;
                              obj.description = a.desc || a.description || `--`

                              ctx.discordInteractionObject.push(obj)
                         }
                         a.minArgs = 0;
                         commandsMade++;
                         if(a.args && typeof a.args == `object` && a.args.length > 0) {
                              let parseUsage;
                              parseUsage = (o) => {
                                   let argument = [`` + `` + ``];
                                   if(o.opt) {argument[0] = `[`; argument[2] = `]`} else {argument[0] = `<`; argument[2] = `>`}
                                   argument[1] = o.arg;
                                   if(o.args && o.args.forEach) {
                                        o.args.forEach(ae => {
                                             argument[1] = argument[1] + ` ` + parseUsage(ae)
                                        })
                                   }; 
                                   return argument.join(``)
                              };
                              let usage = [];
                              a.minArgs = a.args.filter(o => !o.opt).length;
                              a.args.forEach(arg => {usage.push(parseUsage(arg))});
                              a.usage = `;${a.name} ${usage.join(` `)}`
                         } else {
                              a.usage = `;${a.name}`
                         }
                         ctx.cmdsObject[module].commands[a.name] = {
                              aliases: [],
                              desc: a.desc,
                         };
                         if(ctx.groups[module]) {
                              ctx.groups[module].push(a.name);
                         }
                         a.group = module;
                         a.moduleSetting = ctx.moduleSetting.get(module) || {}
                         if(a.moduleSetting && a.moduleSetting.canView !== false && a.moduleSetting.canSet !== false) ctx.totalCmds++;
                         ctx.cmds.set(a.name, a);
                         if(a.aliases) {
                              a.aliases.forEach((alias) => {
                                   if(
                                        ctx.aliases.get(alias) &&
                                        ctx.aliases.get(alias) !== a.name
                                   ) {
                                        console.w(
                                             `┃ The alias "${alias}" has already been set on ${ctx.aliases.get(
                                                  alias
                                             )}, and is also on ${
                                                  a.name
                                             }!`
                                        );
                                   } else {
                                        ctx.cmdsObject[module].commands[
                                             a.name
                                        ].aliases.push(`${alias}`);
                                        ctx.aliases.set(alias, a.name);
                                   }
                              });
                         }
                    } else {
                         ctx.moduleSetting.set(module, a);
                         if(a.canSet === false || a.canSet === undefined) {
                         } else {
                              ctx.groups[module] = [];
                              ctx.groups.array.push(module);
                              ctx.modules.set(module, a);
                         }
                    }
               }
          }

          /*for (let file of files) {
               let c = require(__dirname + "/cmds/" + file);
               let module = file.replace(".js", "");
     
               if(typeof c == "object") {
                    for (let i = 0; i < c.length; i++) {
                         let a = c[i];
                         if(a.func && a.name) {
                              if(typeof a.interactionObject == `object`) {
                                   let obj = a.interactionObject;
                                   obj.name = a.name;
                                   obj.description = a.desc || a.description || `--`

                                   ctx.discordInteractionObject.push(obj)
                              }
                              a.minArgs = 0;
                              commandsMade++;
                              if(a.args && typeof a.args == `object` && a.args.length > 0) {
                                   let parseUsage;
                                   parseUsage = (o) => {
                                        let argument = [`` + `` + ``];
                                        if(o.opt) {argument[0] = `[`; argument[2] = `]`} else {argument[0] = `<`; argument[2] = `>`}
                                        argument[1] = o.arg;
                                        if(o.args && o.args.forEach) {
                                             o.args.forEach(ae => {
                                                  argument[1] = argument[1] + ` ` + parseUsage(ae)
                                             })
                                        }; 
                                        return argument.join(``)
                                   };
                                   let usage = [];
                                   a.minArgs = a.args.filter(o => !o.opt).length;
                                   a.args.forEach(arg => {usage.push(parseUsage(arg))});
                                   a.usage = `;${a.name} ${usage.join(` `)}`
                              } else {
                                   a.usage = `;${a.name}`
                              }
                              ctx.cmdsObject[module].commands[a.name] = {
                                   aliases: [],
                                   desc: a.desc,
                              };
                              if(ctx.groups[module]) {
                                   ctx.groups[module].push(a.name);
                              }
                              a.group = module;
                              a.moduleSetting = ctx.moduleSetting.get(module) || {}
                              if(a.moduleSetting && a.moduleSetting.canView !== false && a.moduleSetting.canSet !== false) ctx.totalCmds++;
                              ctx.cmds.set(a.name, a);
                              if(a.aliases) {
                                   a.aliases.forEach((alias) => {
                                        if(
                                             ctx.aliases.get(alias) &&
                                             ctx.aliases.get(alias) !== a.name
                                        ) {
                                             console.l(
                                                  `┃ The alias "${alias}" has already been set on ${ctx.aliases.get(
                                                       alias
                                                  )}, and is also on ${
                                                       a.name
                                                  }!`
                                             );
                                        } else {
                                             ctx.cmdsObject[module].commands[
                                                  a.name
                                             ].aliases.push(`${alias}`);
                                             ctx.aliases.set(alias, a.name);
                                        }
                                   });
                              }
                         } else {
                         }
                    }
               };
          };*/

          let modulesObj = ctx.discordInteractionObject.find(o => o.name == `modules`);
          modulesObj.options[0].options[0].choices = Array.from(ctx.modules.keys()).map(m => {return {name: m[0].toUpperCase() + m.slice(1).toLowerCase(), value: m.toLowerCase()}});
          
          ctx.discordInteractionObject[ctx.discordInteractionObject.findIndex(o => o.name == `modules`)] = modulesObj;

          //console.log(modulesObj.options[0])

          return res(commandsMade)
     })
}
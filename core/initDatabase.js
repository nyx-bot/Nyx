const fs = require('fs')

module.exports = async function (ctx) {
     return new Promise(async (res, rej) => {
          const { Sequelize, Op, Model, DataTypes } = require("sequelize");
          ctx.libs.Op = Op;
          ctx.libs.Model = Model;
          ctx.libs.DataTypes = DataTypes;
          ctx.libs.Sequelize = Sequelize;
          if(ctx.seq) {
               if(typeof ctx.seq.close == `function`) await ctx.seq.close();
               delete ctx.seq;
          }
          core.boxLog(`┃ Setting up database...`);
          ctx.seq = new Sequelize({
               dialect: "sqlite",
               storage: "database.db",
               logging: false,
               maxConcurrentQueries: 100,
          });
          try {
               await ctx.seq.authenticate();
               core.boxLog(`┃ Authenticated to DB!`);
               ready = true;
          } catch (e) {
               return core.boxLog(`┃ Unable to authenticate to DB! ${e}`);
          }
          ctx.sync = {};
          ctx.seqModel.serversettings = ctx.seq.define("Server", {
               id: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: ``
               },
               prefix: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: `;`
               },
               interactionsEnabled: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: true
               },
               classicCommandsEnabled: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: true
               },
               fun: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
               },
               utility: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
               },
               reactionroles: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
               },
               moderation: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
               },
               music: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
               },
               musicChime: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
               },
               musicVoteSkip: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
               },
               musicLastPlayed: {
                    type: DataTypes.STRING,
                    defaultValue: `[]`,
                    allowNull: false,
               },
               welcome: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
               },
               welcomeChannel: {
                    type: DataTypes.STRING,
                    defaultValue: null,
               },
               welcomeImgMsg: {
                    type: DataTypes.STRING,
                    defaultValue: ``,
               },
               welcomeMsg: {
                    type: DataTypes.STRING,
                    defaultValue: `[]`,
               },
               leaveMsg: {
                    type: DataTypes.STRING,
                    defaultValue: `[]`,
               },
               owomode: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
               },
               logging: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
               },
               loggingInvitesArray: {
                    type: DataTypes.STRING,
                    defaultValue: `[]`
               },
               autorole: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
               },
               autoRolesList: {
                    type: DataTypes.STRING,
                    defaultValue: `[]`,
               },
               loggingchannelID: {
                    type: DataTypes.STRING,
                    defaultValue: null,
               },
               loggingchannelWebhook: {
                    type: DataTypes.STRING,
                    defaultValue: `{}`
               },
               loggingchannels: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
               },
               loggingmoderation: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
               },
               loggingrole: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
               },
               loggingmembers: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
               },
               logginginvites: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
               },
               loggingmessage: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
               },
               djRoles: {
                    type: DataTypes.STRING,
                    defaultValue: `[]`,
               },
               modRoles: {
                    type: DataTypes.STRING,
                    defaultValue: `[]`,
               },
               adminRoles: {
                    type: DataTypes.STRING,
                    defaultValue: `[]`,
               },
               muteRole: {
                    type: DataTypes.STRING,
                    defaultValue: null,
               },
               serverManagerRoles: {
                    type: DataTypes.STRING,
                    defaultValue: `[]`,
               },
          });

          ctx.seqModel.reactionRole = ctx.seq.define("ReactionRole", {
               serverID: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: '',
               },
               channelID: {
                    type: DataTypes.STRING,
                    defaultValue: '',
               },
               messageID: {
                    type: DataTypes.STRING,
                    defaultValue: '',
               },
               name: {
                    type: DataTypes.STRING,
                    defaultValue: '',
               },
               content: {
                    type: DataTypes.STRING,
                    defaultValue: '-- no message --'
               },
               roles: {
                    type: DataTypes.STRING,
                    defaultValue: '[]',
               },
          })
     
          ctx.seqModel.usersettings = ctx.seq.define("User", {
               id: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: '',
               },
               pronouns: {
                    type: DataTypes.STRING,
                    defaultValue: null,
               },
               name: {
                    type: DataTypes.STRING,
                    defaultValue: null,
               },
               supporter: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
               },
          });
     
          ctx.seqModel.afk = ctx.seq.define("Afk", {
               id: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: '',
               },
               message: {
                    type: DataTypes.STRING,
                    defaultValue: '',
               },
               date: {
                    type: DataTypes.STRING,
                    defaultValue: null,
               }
          });
     
          ctx.seqModel.rrole = ctx.seq.define("RRole", {
               messageID: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: true,
               },
               channelID: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: '',
               },
               guildID: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: '',
               },
               message: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: '',
               },
          });
     
          ctx.seqModel.mutes = ctx.seq.define("Mutes", {
               muteId: {
                    type: DataTypes.STRING,
                    defaultValue: ``
               },
               userId: {
                    type: DataTypes.STRING,
                    defaultValue: ``
               },
               guildId: {
                    type: DataTypes.STRING,
                    defaultValue: ``
               },
               muteRole: {
                    type: DataTypes.STRING,
                    defaultValue: ``
               },
               roles: {
                    type: DataTypes.STRING,
                    defaultValue: `[]`
               },
          });
     
          ctx.seqModel.modlogs = ctx.seq.define("Modlogging", {
               logID: {
                    type: DataTypes.STRING,
                    primaryKey: true,
               },
               userID: {
                    type: DataTypes.STRING,
               },
               modID: {
                    type: DataTypes.STRING,
               },
               meta: {
                    type: DataTypes.STRING,
                    defaultValue: null,
               },
               guildID: {
                    type: DataTypes.STRING,
               },
               desc: {
                    type: DataTypes.STRING,
               },
               logType: {
                    type: DataTypes.STRING,
               },
               group: {
                    type: DataTypes.NUMBER,
                    defaultValue: 1,
                    allowNull: false
               },
               duration: {
                    type: DataTypes.NUMBER,
               },
               deleted: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false
               },
          });
     
          ctx.seqModel.timers = ctx.seq.define("Timer", {
               timeDue: {
                    type: DataTypes.NUMBER,
                    allowNull: false,
                    defaultValue: 0
               },
               useId: {
                    type: DataTypes.STRING,
               },
               type: {
                    type: DataTypes.STRING,
               },
               timerID: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: `--`
               },
               run: {
                    type: DataTypes.STRING,
               },
               exec: {
                    type: DataTypes.STRING,
               },
               meta: {
                    type: DataTypes.STRING,
                    defaultValue: null,
               },
          });
     
          ctx.seqModel.economy = ctx.seq.define("Economy", {
               id: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: '',
               },
               balance: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                    allowNull: false,        
               },
               lastdaily: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                    allowNull: false,     
               },
               lastweekly: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                    allowNull: false,     
               },
               lastmonthly: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                    allowNull: false,     
               },
          });
          
          ctx.seqModel.commandsDisabled = ctx.seq.define('DisabledCmds', {
               serverID: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: false,
                    defaultValue: '',
               },
               command: {
                    type: DataTypes.STRING,
                    unique: false,
               },
          })

          await new Promise(async (finish, rej) => {
               let models = Object.entries(ctx.seq.models);
               const modelsCacheDir = `${__dirname.split(`/`).slice(0, -1).join(`/`)}/etc/modelsCache.json`;
               if(!fs.existsSync(modelsCacheDir.replace('/modelsCache.json', ``))) {fs.mkdirSync(modelsCacheDir.replace('/modelsCache.json', ``))}
               if(!fs.existsSync(modelsCacheDir)) {fs.writeFileSync(modelsCacheDir, `{}`)};
               const modelsCache = JSON.parse(fs.readFileSync(modelsCacheDir));
               a = (model) => new Promise(async (res, rej) => {
                    if(modelsCache[model] && JSON.stringify(modelsCache[model]) !== JSON.stringify(ctx.seq.models[model].build())) {
                         console.e(`┃ Model ${model} has not been synchronized yet!`);
                         await ctx.seq.models[model].sync({alter: true}).then(a => {res(core.boxLog(`┃ Synchronized ${model}!`))}).catch(e => {
                              res(console.e(`┃ Failed to set up ${model};`, e))
                         });
                    } else {
                         await ctx.seq.models[model].findOne({where: ctx.seq.models[model].build(), raw: true,}).then(a => {res()}).catch(async e => {
                              console.e(`┃ Model ${model} has not been synchronized yet!`);
                              await ctx.seq.models[model].sync({alter: true}).then(a => {res(core.boxLog(`┃ Synchronized ${model}!`))}).catch(e => {
                                   res(console.e(`┃ Failed to set up ${model};`, e))
                              });
                         });
                    };
                    modelsCache[model] = ctx.seq.models[model].build();
               });
               core.boxLog(`┃ Testing DB models`)
               for(i in models) {
                    let model = models[i][0];
                    await a(model)
               };
               fs.writeFileSync(modelsCacheDir, JSON.stringify(modelsCache))
               return finish();
          });
          return res(core.boxLog(`┃ DB setup complete.`))
     })
}
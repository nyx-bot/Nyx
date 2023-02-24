module.exports = async function (ctx, user) {
     return new Promise(async function (resolve, reject) {
          if(typeof user !== "object") {user = ctx.bot.users.get(user)}
          if(typeof user !== "object") {return reject(`User provided is not an object!`);}
          const u = await utils.lookupUser(ctx, user.id, true);
          let sheet = {
               name: user.username,
               a: `they`,
               b: `their`,
               c: `them`,
               d: `are`,
               custom: false,
          };
          if(!u && (!u.pronouns && !u.name)) {
               return resolve(sheet);
          } else {
               if(u.name) {
                    sheet.name = u.name;
                    sheet.custom = true;
               }; if(u.pronouns && u.pronouns.split(` `).length === 4) {
                    const pronounthingy = u.pronouns.split(` `)
                    sheet.a = pronounthingy[0]
                    sheet.b = pronounthingy[1]
                    sheet.c = pronounthingy[2]
                    sheet.d = pronounthingy[3]
                    sheet.custom = true;
               } else if(u.pronouns && u.pronouns.startsWith("they") || u.pronouns == "any") {
                    sheet.custom = true;
               } else if(u.pronouns && u.pronouns.startsWith(`she`)) {
                    sheet.a = `she`;
                    sheet.b = `her`;
                    sheet.c = `her`;
                    sheet.d = `is`;
                    sheet.custom = true;
               } else if(u.pronouns && u.pronouns.startsWith(`he`)) {
                    sheet.a = `he`;
                    sheet.b = `his`;
                    sheet.c = `him`;
                    sheet.d = `is`;
                    sheet.custom = true;
               }
               return resolve(sheet);
          }
     });
}
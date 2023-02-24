module.exports = async function (guild, string, type) {
     if(typeof guild == "string") return undefined;
     if(!string || string == undefined || string == null) return null;
     let extended = false;
     if(!type) {
          type = "all";
     } else if(type == `extended`) {extended = true; type = `all`}
     if(typeof string == "object") {
          let array = [];
          string.forEach(async (str) => {
               str = str.toLowerCase();
               member = null;
               if(str.match(/\d+/)) {
                    try {
                         member = await guild.members.find(
                              (user) => user.user.id == str.match(/\d+/)[0]
                         ).id;
                    } catch (e) {}
                    if(member) return array.push(member);
               }
               {
                    try {
                         member = await guild.members.find(
                              (user) =>
                                   user.user.username.toLowerCase() +
                                        `#` +
                                        user.user.discriminator.toLowerCase() ==
                                   str
                         ).id;
                    } catch (e) {}
                    if(member) {
                         array.push(member);
                    } else {
                         try {
                              if(type == "all") {
                                   member = await guild.members.find(
                                        (user) =>
                                             (
                                                  user.user.username.toLowerCase() +
                                                  `#` +
                                                  user.user.discriminator.toLowerCase()
                                             ).substring(0, str.length) == str
                                   ).id;
                              }
                         } catch (e) {}
                         if(member) {
                              array.push(member);
                         } else {
                              try {
                                   if(type == "all") {
                                        member = await guild.members.find(
                                             (user) =>
                                                  user.user.username.toLowerCase() ==
                                                  str
                                        ).id;
                                   }
                              } catch (e) {}
                              if(member) {
                                   array.push(member);
                              } else {
                                   try {
                                        if(type == "all") {
                                             member = await guild.members.find(
                                                  (user) =>
                                                       user.user.username
                                                            .toLowerCase()
                                                            .substring(
                                                                 0,
                                                                 str.length
                                                            ) == str
                                             ).id;
                                        }
                                   } catch (e) {}
                                   if(member) {
                                        array.push(member);
                                   }
                              }
                         }
                    }
               }
          });
          return array;
     } else {
          string = string.toLowerCase();
          if(string.length === 1) return null;
          member = null;
          if(string.match(/\d+/)) {
               try {
                    member = await guild.members.find(
                         (user) => user.user.id == string.match(/\d+/)[0]
                    ).id;
               } catch (e) {}
               if(member) return member;
          }
          try {
               member = await guild.members.find(
                    (user) =>
                         user.user.username.toLowerCase() +
                              `#` +
                              user.user.discriminator.toLowerCase() ==
                         string
               ).id;
          } catch (e) {}
          if(member) return member;
          try {
               if(type == "all") {
                    member = await guild.members.find(
                         (user) =>
                              (
                                   user.user.username.toLowerCase() +
                                   `#` +
                                   user.user.discriminator.toLowerCase()
                              ).substring(0, string.length) == string
                    ).id;
               }
          } catch (e) {}
          if(member) return member;
          try {
               if(type == "all") {
                    member = await guild.members.find(
                         (user) => user.user.username.toLowerCase() == string
                    ).id;
               }
          } catch (e) {}
          if(member) return member;
          try {
               if(type == "all") {
                    member = await guild.members.find(
                         (user) =>
                              user.user.username
                                   .toLowerCase()
                                   .substring(0, string.length) == string
                    ).id;
               }
          } catch (e) {}
          if(extended && !member) {
               try {
                    member = await utils.resolveUser(string)
               }catch(e){}
          }
          return member;
     }
}
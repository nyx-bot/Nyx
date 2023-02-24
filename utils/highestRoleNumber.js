module.exports = function(guild, roles) {
     let num = 0;
     roles.forEach(id => {
          if(guild.roles.find(role => role.id == id).position > num) {
               num = guild.roles.find(role => role.id == id).position
          };
     });
     return num;
}
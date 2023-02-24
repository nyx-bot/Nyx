module.exports = async (ctx, guild) => {
     const total = guild.members.filter(m => m.user && typeof m.user.bot == `boolean`).length;
     const bots = guild.members.filter(m => m.user.bot).length;
     const percentage = Math.floor( (bots / total) * 100 )
     const r = {
          result: bots >= 30 && percentage >= 70 && total >= 35 ? true : false,
          botCount: bots,
          totalMemberCount: total,
          percentage
     };
     return r
}
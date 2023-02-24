module.exports = {
    status: (ctx, serverID, command) => new Promise(async res => {
         const exists = await ctx.seq.models.DisabledCmds.findOne({where: {serverID, command}, raw: true});
         if(exists !== null && exists && exists.id && exists.createdAt && exists.updatedAt && exists.serverID && exists.serverID == serverID && exists.command && exists.command == command) {res(true); console.d(JSON.stringify(exists))} else {res(false)}
    }),

    disable: (ctx, serverID, command) => new Promise(async res => {
         const exists = await ctx.seq.models.DisabledCmds.findOne({where: {serverID, command}, raw: true});
         if(exists) {res(false)} else {
              await ctx.seq.models.DisabledCmds.create({serverID, command}); // create entry for server and specific command to be read each time cmd is used. (if this entry is found, it will return and not do anything. cheap, right? my coding is so shit omg)
              res(true)
         }
    }),

    enable: (ctx, serverID, command) => new Promise(async res => {
         const exists = await ctx.seq.models.DisabledCmds.findOne({where: {serverID, command}, raw: true});
         if(!exists) {res(false)} else {
              await ctx.seq.models.DisabledCmds.destroy({where: {serverID, command}}); // remove above said entry
              res(true)
         }
    }),
}

module.exports = async function(ctx, folder) {
     if(!folder) {folder = __dirname + `/etc`}
     const oldPrefixes = Object.entries(JSON.parse(require('fs').readFileSync(`${folder}/prefixes.json`)));
     const oldProfiles = Object.entries(JSON.parse(require('fs').readFileSync(`${folder}/profileInfo.json`)));
     const old = await ctx.seq.models.Server.findAll()
     for (num in oldPrefixes) {
          await ctx.timeout(250)
          const pfix = oldPrefixes[num];
          const guild = pfix[0]
          const prefix = pfix[1].prefixes;
          if(prefix !== `;`) {
               const g = await ctx.seq.models.Server.build({prefix, id: guild});
               
               await g.save().then(a => {
                    const obj = a.dataValues
                    console.l(`Prefix for ${obj.id}: ${obj.prefix}`);
               })
          };
     }
     const newL = ctx.seq.models.Server.findAll();
     console.l(`Added ${newL.length - old.length} guild entries to the DB`)
     
     for (num in oldProfiles) {
          await ctx.timeout(250)
          const user = oldProfiles[num];
          const name = user[1].name
          const pronouns = user[1].pronouns
          let opt = {id: user[0]}
          if(name !== 'N/A') {opt.name = name}
          if(pronouns !== 'N/A') {opt.pronouns = pronouns}
          if(JSON.stringify(opt) !== `{}`) {
               await ctx.seq.models.User.create(opt).then(a => {
                    const obj = a.dataValues
                    console.l(`${obj.id}:\n┃ Name: ${obj.name}\n┃ Pronouns: ${obj.pronouns}`)
               })
          }
     }
}
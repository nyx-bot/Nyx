const fs = require('fs');

const { Sequelize, Model, DataTypes } = require('sequelize');

module.exports = () => new Promise(async res => {
    ctx.seq = new Sequelize({
        dialect: `sqlite`,
        storage: `./core/database/database.db`,
        logging: false,
    });

    try {
        await ctx.seq.authenticate();
        console.log(`Successfully authenticated to DB`)
    } catch(e) {
        console.error(`Failed to authenticate to DB:`, e);
        process.exit(1)
    }

    const tables = fs.readdirSync(`./core/database/tables/`);

    for(table of tables) {
        if(table.endsWith(`.js`)) {
            console.log(`Parsing table "${table}"`)
            let f = require(`./tables/${table}`);
            if(typeof f == `function`) {
                f()
            } else if (typeof f == `object`) {
                const name = `${table.split(`.`).slice(0, -1).join(`.`)[0].toUpperCase()}${table.split(`.`).slice(0, -1).join(`.`).slice(1)}`;
                console.log(`Defining ${name}`)
                ctx.seq.define(name, f)
            }
        } else if(fs.existsSync(`./core/database/tables/${table}/`)) {
            console.log(`Parsing tables in ${table}...`)
            tables2 = fs.readdirSync(`./core/database/tables/${table}/`);
            for(t of tables2) {
                let f = require(`./tables/${table}/${t}`);
                console.log(`> ${t} // ${typeof f}`);
                if(typeof f == `function`) {
                    f()
                } else if (typeof f == `object`) {
                    const name = `${table}${t.split(`.`).slice(0, -1).join(`.`)[0].toUpperCase()}${t.split(`.`).slice(0, -1).join(`.`).slice(1)}`;
                    console.log(`Defining ${name}`)
                    ctx.seq.define(name, f)
                }
            }
        }
    }
    
    await new Promise(async (finish, rej) => {
        let models = Object.entries(ctx.seq.models);
        const modelsCacheDir = `${__dirname}/modelsCache.json`;
        if(!fs.existsSync(modelsCacheDir.replace('/modelsCache.json', ``))) {fs.mkdirSync(modelsCacheDir.replace('/modelsCache.json', ``))}
        if(!fs.existsSync(modelsCacheDir)) {fs.writeFileSync(modelsCacheDir, `{}`)};
        const modelsCache = JSON.parse(fs.readFileSync(modelsCacheDir));
        a = (model) => new Promise(async (res, rej) => {
             if(modelsCache[model] && JSON.stringify(modelsCache[model]) !== JSON.stringify(ctx.seq.models[model].build())) {
                  console.log(`┃ Model ${model} has not been synchronized yet!`);
                  await ctx.seq.models[model].sync({alter: true}).then(a => {res(console.log(`┃ Synchronized ${model}!`))}).catch(e => {
                       res(console.log(`┃ Failed to set up ${model};`, e))
                  });
             } else {
                  await ctx.seq.models[model].findOne({where: ctx.seq.models[model].build(), raw: true,}).then(a => {res()}).catch(async e => {
                       console.log(`┃ Model ${model} has not been synchronized yet!`);
                       await ctx.seq.models[model].sync({alter: true}).then(a => {res(console.log(`┃ Synchronized ${model}!`))}).catch(e => {
                            res(console.log(`┃ Failed to set up ${model};`, e))
                       });
                  });
             };
             modelsCache[model] = ctx.seq.models[model].build();
        });
        console.log(`┃ Testing DB models`)
        for(i in models) {
             let model = models[i][0];
             await a(model)
        };
        fs.writeFileSync(modelsCacheDir, JSON.stringify(modelsCache))
        return finish();
   });
})
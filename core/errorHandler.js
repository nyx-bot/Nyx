const fs = require('fs');

const errors = fs.readdirSync(`./core/errorHandler/`);

let handlers = [];

for(let name of errors) {
    try {
        let handler = require(`./errorHandler/${name}`);
        handler.name = name.split(`.`).slice(0, -1).join(`.`)
        if(handler.find && handler.func) {
            handlers.push(handler);
            console.debug(`Added error handler ${name}`)
        } else {
            // oh the irony, if there ever will be an error from the error handler
            console.warn(`Failed adding error handler ${name}: "find" and "func" do not exist in object!`)
        }
    } catch(e) {
        console.warn(`Failed adding error handler ${name}: ${e}`)
    }
};

handlers = handlers.sort();

console.debug(`Error handlers: ${handlers.map(o => o.name).join(`, `)}`)

function handler(e) {
    const msgs = {
        openIssue: `If that doesn't work, please feel free to open an issue at https://github.com/nyx-bot/Nyx/issues`
    }

    const handler = handlers.find(o => o.find(e));

    if(handler) {
        console.debug(`Found error handler ${handler.name}`);
        handler.func(e, msgs)
    } else {
        console.debug(`No handler for ${e}`);
        console.error(e);
    }
};

handler.find = e => handlers.find(o => o.find(e))

module.exports = handler
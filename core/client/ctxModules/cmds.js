const fs = require('fs'), readCommand = require('../../readCommand')

let cmds = {}

const modules = fs.readdirSync(`./core/client/cmdModules/`);

for (m of modules) {
    try {
        const commands = fs.readdirSync(`./core/client/cmdModules/${m}/`);
        console.d(`Adding module ${m} with ${commands.length} cmd(s)`);

        for (let cmd of commands) {
            let name = cmd.split(`.`).slice(0, -1).join(`.`);
            
            cmds[name] = readCommand(m, cmd, name);
        }
    } catch(e) {
        console.error(`Failed adding command module "${m}"`, e)
    }
};

console.d(`Commands object:`, require('util').inspect(cmds, false, 3))

module.exports = cmds
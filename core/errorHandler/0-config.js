module.exports = {
    find: (e) => `${e}`.toLowerCase().includes(`cannot find module`) && `${e}`.includes(`config.json`),
    func: (e, msgs) => {
        if(require('fs').existsSync(`./config.example.json`)) {
            require('fs').cpSync(`./config.example.json`, `./config.json`);
            console.error(`Unable to find your configuration file!\nI've created an example config.json file for you! Make sure to edit this file accordingly!`)
        } else {
            console.error(`Unable to find your configuration file!\nPlease create a file named "config.json" and make your configuration based on "config.example.json" either in the repository or within this same directory!`)
        };
        process.exit(1)
    }
}
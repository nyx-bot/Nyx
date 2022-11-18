module.exports = {
    find: (e) => `${e}`.toLowerCase().includes(`cannot find module`),
    func: (e, msgs) => {
        const unknownModule = `${e}`.slice(`${e}`.toLowerCase().indexOf(`cannot find module`)).split(`'`)[1]
        if(require('fs').existsSync(`./node_modules`)) {
            console.error(`Unable to find ${unknownModule}\n| Try running "npm install" again to make sure packages are up to date!\n| ${msgs.openIssue}`)
        } else {
            console.error(`Unable to find ${unknownModule}\n| There is no node_modules directory! Have you already installed dependencies?\n| - Run "npm install" to make sure everything is installed and up to date!\n| ${msgs.openIssue}`)
        };
        process.exit(1)
    }
}
module.exports = {
    find: (e) => `${e}`.toLowerCase().includes(`cannot find module`) && `${e}`.includes(`/lang/`),
    func: (e, msgs) => {
        const name = (`${e}`.split(`/`).slice(1).join(`/`).split(` `)[0].split(`'`)[0]).split(`lang/`)[1]
        if(require('fs').readdirSync(`./lang/`).length > 0) {
            console.error(`Failed to find lang file ${name}\n| Please make sure Nyx's language files are up to date with "git submodule update --remote" (Language files exist, just update them!)\n| ${msgs.openIssue}`)
        } else {
            console.error(`Failed to find lang file ${name}\n| Please ensure that you have Nyx's language files downloaded using "git submodule update --init" (I was able to find none)\n| ${msgs.openIssue}`)
        };
        process.exit(1)
    }
}
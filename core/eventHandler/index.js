const fs = require('fs')

module.exports = () => {
    console.log(`Adding event groups...`);

    const groups = fs.readdirSync(`./core/eventHandler`).filter(f => fs.existsSync(`./core/eventHandler/${f}/`));

    for(group of groups) {
        console.log(`> Group "${group}"`);
        const events = fs.readdirSync(`./core/eventHandler/${group}/`).filter(f => f.endsWith(`.js`));
        console.log(`> ${events.length} event${events.length === 1 ? `` : `s`}`);
        for(e of events) {
            try {
                const evnt = require(`./${group}/${e}`);
                if(typeof evnt == `function`) {
                    const eventName = e.slice(0, -2);
                    ctx.bot.on(eventName, evnt);
                    console.log(`Successfully added ${eventName}`)
                } else {
                    console.error(`Event does not export a function!`, group, `./core/eventHandler/${group}/${e}`)
                }
            } catch(e) {ctx.errMsg(null, `> Unable to add event "${e}"`, e, group, `./core/eventHandler/${group}/${e}`)}
        }
    }
}
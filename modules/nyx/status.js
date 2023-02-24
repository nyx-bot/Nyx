const buildRequest = () => ctx.libs.superagent
    .post(`https://api.uptimerobot.com/v2/getMonitors?format=json`)
    .send(`api_key=ur1409718-5ec4181d90e06387f65ea69d`)
    .send(`custom_uptime_ratios=7-30`);

let cached = null;

module.exports = {
    "name": "nyxstatus",
    "desc": "Get the status of every service relating to Nyx!",
    "args": [],
    "aliases": [
        "status",
    ],
    "interactionObject": {},
    func: async function links(ctx, msg, args) {
        let m;
        
        let statuses = {
            0: `Unknown`,
            1: `Unknown`,
            2: `Up`,
            8: `Down`,
            9: `Down`
        }, emojis = {
            0: ctx.emoji.status.unknown,
            1: ctx.emoji.status.unknown,
            2: ctx.emoji.status.available,
            8: ctx.emoji.status.unavailable,
            9: ctx.emoji.status.unavailable
        };

        const parse = (r) => {
            if(r.body && r.body.monitors && r.body.monitors.length > 0) {
                let services = r.body.monitors.filter(o => !o.friendly_name.toLowerCase().includes(`dev`) && o.status != 0).map(o => {
                    return {
                        name: o.friendly_name,
                        status: statuses[o.status],
                        icon: emojis[o.status],
                        uptime: {
                            week: Math.round(o.custom_uptime_ratio.split(`-`)[0]),
                            month: Math.round(o.custom_uptime_ratio.split(`-`)[1]),
                        },
                        //raw: o,
                    }
                }), offline = services.filter(o => o.status != `Up`);

                console.d(services)

                let emoji = ctx.emoji.nyx.happy;

                if(offline.length > (services/3)*2) { // example: 6/9 services online
                    console.d(`${offline.length}/${services.length} online; hits threshold of ${(services/3)*2}`)
                    emoji = ctx.emoji.nyx.cry
                } else if(offline.length > (services/3)) { // example: 3/9 services online
                    console.d(`${offline.length}/${services.length} online; hits threshold of ${(services/3)}`)
                    emoji = ctx.emoji.nyx.confusion
                };

                console.d(`emoji: ${emoji}`)

                let content = `${emoji} ${offline.length === 0 ? `All services are online!` : `${offline.length} service${offline.length == 1 ? `` : `s`} are offline! (${services.length} online)`}`

                return (m && m.edit ? m.edit : msg.reply)({
                    content,
                    embeds: [
                        {
                            title: `Nyx's Status`,
                            color: ctx.utils.colors('random'),
                            fields: services.map(s => {
                                return {
                                    name: `${s.icon} ${s.name.includes(`] `) ? s.name.split(`] `)[1] : s.name}`,
                                    value: `\n> 7 days: ${s.uptime.week}%\n> 30 days: ${s.uptime.month}%`,
                                    inline: true,
                                }
                            })
                        }
                    ]
                })
            } else {
                if(!r.body || !r.body.monitors) {
                    return (m && m.edit ? m.edit : msg.reply)({
                        content: `${ctx.emoji.nyx.confusion} ${ctx.errMsg(`No body or list of monitors was received!`)}`,
                    })
                } else if(r.body.monitors.length <= 0) {
                    return (m && m.edit ? m.edit : msg.reply)({
                        content: `${ctx.emoji.nyx.confusion} ${ctx.errMsg(`No monitors were returned!`)}`,
                    })
                } else {
                    return (m && m.edit ? m.edit : msg.reply)({
                        content: `${ctx.emoji.nyx.confusion} ${ctx.errMsg()}`,
                    })
                }
            }
        }

        if(cached) {
            console.d(`Response already cached!`)
            parse(cached)
        } else {
            msg.defer();

            buildRequest().then(async r => {
                if(r.body && r.body.monitors && r.body.monitors.length > 0) {
                    parse(r);
                    cached = r;
                    setTimeout(() => {
                        console.d(`Deleting cached status!`)
                        cached = null;
                    }, 15000)
                } else parse({})
            }).catch(e => {
                return (m && m.edit ? m.edit : msg.reply)({
                    content: `${ctx.emoji.nyx.confusion} ${ctx.errMsg(`Uptime endpoint returned an error! (HTTP: ${e.status})`)}`
                })
            })
        }
    }
}
module.exports = {
    "name": "cat",
    "desc": "random cat image!!!",
    "args": [],
    "aliases": [
        "catto"
    ],
    "interactionObject": {},
    func: async function(ctx, msg, args) {
        var uwu = args[0]
        if(!args[0]) uwu = 'random'
        var nyxapi = ('https://nyx.bot/api/v1/cat/' + uwu);
        let squeaks = ["cat! uwu", "here's a blessing for you :3", ":3c", "mrrow"]
    
        ctx.libs.superagent
            .get(nyxapi).set(`authorization`, ctx.keys.nyxbotapi)
            .then(r => {fuckyoujavascript = r.body
                let catresponse = Math.floor((Math.random() * squeaks.length));
        
                embed = {
                    image: {
                        url: fuckyoujavascript.URL
                    },
                    description: squeaks[catresponse],
                    footer: {text: `Image ${fuckyoujavascript.number}/${fuckyoujavascript.total}`},
                    color: ctx.utils.colors('random')
                }
                
                msg.reply({embeds: [embed]})
            })
            .catch(err => {
                if(err.response.statusCode === 404) {
                    return msg.reply(`${ctx.fail} I only have ${err.response.body.total} pictures!`)
                }
                let errembed = {
                    title: (`My API is not working! \`🔴 ${err.response.statusCode}\``),
                    description: (`` + err.statusText + ` - Please try again later.\n\n[Nyx Status](https://status.nyx.bot)`),
                    color: ctx.utils.colors('red_dark')
                }
                msg.reply({embeds: [errembed]})
            });
    }
}
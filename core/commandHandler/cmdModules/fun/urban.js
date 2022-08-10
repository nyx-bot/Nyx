const cacheOfResponses = {}

const findResponses = (interaction, query, n, deferReplyFunc, defer, func) => new Promise(async (res, rej) => {
    let base = `http://api.urbandictionary.com/v0/define?term=`
    let termA = encodeURI(query);

    const reply = async (r, funcProp) => {
        if(r.body.list.length > 0) {
            if(n+1 > r.body.list.length || n < 0) n = 0;
            let term = r.body.list[n]
            var trimmedfafa = false;
            var length = 512;var trimmed = (`${term.definition}`).substring(0, length);var definition;if(trimmed !== term.definition) {trimmedfafa = true; definition = `${trimmed}`} else {definition = term.definition}
            if(trimmedfafa) {definition = `${definition}... <bg>${interaction.langFile.responses.main.continue}<end>(${term.permalink})`}
            var trimmedfafa = false;
            var trimmedB = (`${term.example}`).substring(0, length);var example;if(trimmedB !== term.example) {trimmedfafa = true; example = `${trimmedB}`} else {example = trimmed}
            if(trimmedfafa) {example = `${example}... <bg>${interaction.langFile.responses.main.continue}<end>(${term.permalink})`}
            
            let embed = new ctx.libs.builder.EmbedBuilder()
            .setTitle(`Urban Dictionary: **${term.word}** [${n+1}/${r.body.list.length}]`)
            .setColor(ctx.utils.colors('random'))
            .setDescription(`\n> ${(definition).replace(/\[/g, '**').replace(/\]/g, '**').replace(/<br>/g, '\n').replace(/\n/g, '> ').replace(/<bg>/g, '[').replace(/<end>/g, ']')}\n\n**${interaction.langFile.responses.main.examples}**\n${(trimmedB).replace(/\[/g, '**').replace(/\]/g, '**')}\n\n[__**${interaction.langFile.responses.main.view}**__](${term.permalink})`)
            .setFooter({ text: `👍 ${term.thumbs_up} 👎 ${term.thumbs_down}   |   ${interaction.langFile.responses.main.author}: ${term.author}` });

            const buttons = [];
        
            buttons.push(
                new ctx.libs.builder.MessageButton()
                .setCustomId(`previous`)
                .setLabel(`◀ ` + `${interaction.langFile.responses.buttons.previous}`)
                .setStyle(`Secondary`)
                .setDisabled(r.body.list[n-1] ? false : true)
            )
        
            buttons.push(
                new ctx.libs.builder.MessageButton()
                .setCustomId(`next`)
                .setLabel(`${interaction.langFile.responses.buttons.next}` + ` ▶`)
                .setStyle(`Primary`)
                .setDisabled(r.body.list[n+1] ? false : true)
            )
        
            return res(interaction[funcProp]({
                content: `${ctx.emojis.nyx.happy} ` + (r.body.list.length === 1 ? interaction.langFile.responses.messages[`one-result`] : interaction.langFile.responses.messages[`more-than-one-result`]).replace(/%num%/g, r.body.list.length).replace(/%query%/g, ctx.utils.escape(query)),
                //content: `${ctx.emojis.nyx.happy} I found ${r.body.list.length} result${r.body.list.length.length === 1 ? `` : `s`} for **${ctx.utils.escape(query)}**`,
                embeds: [embed.toJSON()],
                components: [new ctx.libs.builder.MessageActionRow().addComponents(...buttons)],
            }))
        } else return res(interaction.editReply(`${ctx.emojis.fail} ${interaction.langFile.responses.messages[`no-definition`].replace(/%query%/g, ctx.utils.escape(decodeURI(termA).replace(/%20/g, ' ')))}`))
        //} else return res(interaction.editReply(`${ctx.emojis.fail} There is no definition of **${ctx.utils.escape(decodeURI(termA).replace(/%20/g, ' '))}**!`))
    };

    const errHandler = (err, interaction) => {
        let message = null;
    
        return res(interaction.editReply(ctx.errMsg(interaction, message ? `${message} [${err.status}]` : null, `Error handling urban dictionary request`, err)))
    };

    if(!cacheOfResponses[termA]) {
        interaction[defer]().then(() => {
            try {
                require('superagent').get(base + termA).then(r => {
                    reply(r, deferReplyFunc);
                    cacheOfResponses[termA] = r;
                    cacheOfResponses[termA].timeout = setTimeout(() => {delete cacheOfResponses[termA]}, 900000)
                })
            } catch(err) { errHandler(err, interaction) }
        })
    } else try {
        reply(cacheOfResponses[termA], func);
        if(cacheOfResponses[termA].timeout) { clearTimeout(cacheOfResponses[termA].timeout) }
        cacheOfResponses[termA].timeout = setTimeout(() => {delete cacheOfResponses[termA]}, 900000)
    } catch(err) { errHandler(err, interaction) }
});

const buttonFunc = async interaction => {
    const clicked = interaction.component.customId;

    try {
        const query = interaction.message.embeds[0].title.slice(20).split(`[`)[0].slice(0, -3)
        const num = Number(interaction.message.embeds[0].title.split(` `).reverse()[0].slice(1, -1).split(`/`)[0])-1;

        console.log(`Query: ${query}\n| New index: ${num}`)

        findResponses(interaction, query, clicked == `previous` ? num-1 : num+1, `editReply`, `deferUpdate`, `update`);
    } catch(e) {}
}

const func = interaction => {
    findResponses(interaction, interaction.options.getString(`query`, false), 0, `editReply`, `deferReply`, `reply`)
};

module.exports = {
    func,
    buttonFunc,
    interactionOptions: [
        {
            type: `string`,
            requred: true
        }
    ]
    //interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
    //    .setDescription(`Search a term on the worst dictionary :)`)
    //    .setDefaultPermission(true)
    //    .addStringOption(s => {
    //        s.setName(`query`);
    //        s.setDescription(`The term you want to look up`)
    //        s.setRequired(true);
//
    //        return s;
    //    })
}
module.exports = ({interaction, content, locale}) => new Promise(async (res, rej) => {
    const d = ctx.parseReplyContent(content);

    console.d(`Parsed reply content!`)

    if(locale.missingValues) {
        console.d(`Appending missing values message to content.`)
        d[0].content = `${ctx.emoji.nyx.translator} ${generalLocale.missingTranslation}` + d[0].content ? `\n\n${d[0].content}` : ``
    };

    if(!interaction.acknowledged) {
        console.d(`Interaction was not previously acknowledged.`);

        interaction.createMessage(d[0]).then(() => res(Object.assign(interaction, {
            acknowledged: true,
            flags: d[0].flags,
            edit: (...content) => ctx.replyHandler({interaction, content, locale}),
            reply: (...content) => ctx.replyHandler({interaction, content, locale}),
        }))).catch(rej)
    } else {
        console.d(`Interaction was previously acknowledged.`);

        if(d[0].flags && d[0].flags != interaction.flags) {
            console.d(`Creating followup; new message content flags exist, but did not exist on previous message!`)

            interaction.createFollowup(d[0]).then(() => res(Object.assign(interaction, {
                acknowledged: true,
                flags: d[0].flags,
                edit: (...content) => ctx.replyHandler({interaction, content, locale}),
                reply: (...content) => ctx.replyHandler({interaction, content, locale}),
            }))).catch(rej)
        } else if(typeof d[0].flags != `number` || d[0].flags == interaction.flags) {
            console.d(`Editing original message -- flags remain the same, or new flags were not specified.`)

            interaction.editOriginal(d[0]).then(() => res(Object.assign(interaction, {
                acknowledged: true,
                edit: (...content) => ctx.replyHandler({interaction, content, locale}),
                reply: (...content) => ctx.replyHandler({interaction, content, locale}),
            }))).catch(rej)
        } else console.d(`Don't know what to do in this situation. (d[0].flags: ${d[0].flags} / interaction.flags: ${interaction.flags})`)
    }
})
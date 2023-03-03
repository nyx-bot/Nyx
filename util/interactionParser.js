module.exports = (interaction) => new Promise(async res => {
    interaction = Object.assign(interaction, ctx.utils.interactionExtensions)

    if(interaction.data.options && typeof interaction.data.options == `object` && interaction.data.options.raw && typeof interaction.data.options.raw.length == `number`) {
        console.d(`Parsing arguments!`)

        for(opt of interaction.data.options.raw) {
            if(opt.value !== undefined) {
                if(opt.type == 11) {
                    console.d(interaction.data.resolved.attachments)
                    if(interaction.data.resolved && interaction.data.resolved.attachments && interaction.data.resolved.attachments[opt.value]) {
                        console.d(`data for resolved attachments exist!`)
                        attachments.push(interaction.data.resolved.attachments[opt.value])
                    } else attachments.push(opt)
                } else if(opt.type == 6) {
                    interaction.mentions.members.push(interaction.channel.guild.members.find(m => m.id == opt.value) || (await interaction.channel.guild.fetchMembers({userIDs: [opt.value]})))
                    interaction.args.push(opt.value.toString())
                    console.d(interaction.mentions)
                    console.d(...opt.value.toString().split(` `))
                } else {
                    interaction.args.push(...opt.value.toString().split(` `))
                }
            } else {
                interaction.args.push(opt.name);
                if(opt.options && typeof opt.options == `object` && typeof opt.options.length == `number`) {
                    opt.options.forEach(opt2 => {
                        if(opt2.value !== undefined) {
                            if(opt2.type !== 11) {
                                interaction.args.push(...opt2.value.toString().split(` `))
                            } else {
                                attachments.push(opt2.value)
                            }
                        } else {
                            interaction.args.push(opt2.name)
                        }
                    })
                }
            }
        };
    };

    return res(interaction)
})
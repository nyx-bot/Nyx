const func = interaction => {
    const member = (interaction.options.getMember(`user`, false) || interaction.member);

    if(!member.user) {
        return interaction.reply({ ephemeral: true, content: ctx.errMsg(interaction, `I wasn't able to get the details of that member!`, `Invalid user object`, interaction, member) })
    } else member.user.fetch().then(user => {
        const embed = new ctx.libs.builder.Embed()
        .setTitle(`${ctx.utils.escape(member.user.username)}#${ctx.utils.escape(member.user.discriminator)}`)
        .setImage(member.user.bannerURL({ size: 600, dynamic: true }))
        .setColor(ctx.utils.colors(`random`));
        
        interaction.reply({
            content: `Banner of **${ctx.utils.escape(member.user.username)}**`,
            embeds: [embed],
        }).then(async r => {
            ctx.libs.jimp.read(member.user.bannerURL({
                dynamic: false, 
                format: `png`,
                size: 4096, // biggest size that discord's CDN holds
            })).then(async img => {
                const size = img.bitmap.width > img.bitmap.height ? img.bitmap.width : img.bitmap.height

                let discordCDNSizes = [ 16, 32, 56, 64, 96, 128, 256, 300, 512, 600, 1024, 2048, 4096 ];

                let imageURLs = [];

                let components = [];
        
                let buttons = [];

                const sizes = discordCDNSizes.filter(s => size > s);

                const append = (button) => {
                    if(buttons.length >= 5) {
                        components.push(new ctx.libs.builder.MessageActionRow().addComponents(...buttons));
                        console.log(`added component w ${buttons.length} buttons`)
                        buttons = [];
                    }; buttons.push(button)
                }

                for(s of sizes.slice(-10)) if(typeof s === `number`) append(
                    new ctx.libs.builder.MessageButton()
                    .setURL(member.user.bannerURL({ size: s, format: `png`, dynamic: true }))
                    .setLabel(`${s}px`)
                    .setStyle(`LINK`)
                )
                
                if(size-5 > sizes.slice(-1)[0]) {
                    console.log(`biggest size is greater than ${sizes[sizes.length-1]}px (${size}) -- will choose ${discordCDNSizes[discordCDNSizes.indexOf(sizes.slice(-1)[0])+1]}`)
                    buttons.pop();
                    append(
                        new ctx.libs.builder.MessageButton()
                        .setURL(member.user.bannerURL({ size: discordCDNSizes[discordCDNSizes.indexOf(sizes.slice(-1)[0])+1], format: `png`, dynamic: true }))
                        .setLabel(`${size}px (Original)`)
                        .setStyle(`LINK`)
                    )
                } else {
                    if(buttons[buttons.length-1]) buttons[buttons.length-1].setLabel(buttons[buttons.length-1].label + ` (Original)`)
                }
        
                for(let imgSize of sizes) imageURLs.push(`[**\`[${imgSize}px]\`**](${member.user.bannerURL({ size: imgSize, dynamic: true })})`)

                if(size-5 > sizes.slice(-1)[0]) imageURLs.push(`[**\`[Original]\`**](${member.user.bannerURL({ size: discordCDNSizes[discordCDNSizes.indexOf(sizes.slice(-1)[0])+1], dynamic: true })})`);

                embed.setDescription(imageURLs.join(` `));
                
                components.push(new ctx.libs.builder.MessageActionRow().addComponents(...buttons));

                interaction.editReply({
                    content: `Banner of **${ctx.utils.escape(member.user.username)}**`,
                    embeds: [embed],
                    components
                })
            })
        })
    })
};

module.exports = {
    func,
    interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
        .setDescription(`Retrieve someone's profile picture!`)
        .setDefaultPermission(true)
        .addUserOption(s => {
            s.setName(`user`)
            s.setDescription(`The person who has the profile picture`)
            s.setRequired(false);

            return s;
        })
}
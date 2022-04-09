const func = interaction => {
    const content = interaction.options.getString(`message`, false);

    if(interaction.options.data.length === 0) return interaction.reply({
        content: `${ctx.emojis.fail} There is no message content!`, 
        ephemeral: true
    });

    const obj = {
        embeds: []
    };

    let embedCharacterCount = 0;

    if(content) {
        if(content.length > 2000) {
            return interaction.reply({
                content: `${ctx.emojis.fail} I cannot send messages above the character limit of 2,000!`, 
                ephemeral: true
            })
        } else {
            obj.content = content;
        }
    }
    
    if(interaction.options.getString(`title`, false) && interaction.options.getString(`title`, false).length <= 256) {
        if(!obj.embeds[0]) { obj.embeds[0] = new ctx.libs.builder.Embed() }
        try {
            obj.embeds[0].setTitle(`${interaction.options.getString(`title`, false)}`);
            embedCharacterCount = embedCharacterCount + interaction.options.getString(`title`, false).length
        } catch(e) { 
            return interaction.reply({
                content: `${ctx.emojis.fail} Invalid Title!`, 
                ephemeral: true
            }) 
        }
    } else if(interaction.options.getString(`title`, false)) return interaction.reply({ ephemeral: true, content: `${ctx.emojis.fail} Titles have a limit of **256** characters!` })
    
    if(interaction.options.getString(`description`, false) && interaction.options.getString(`description`, false).length <= 4096) {
        if(!obj.embeds[0]) { obj.embeds[0] = new ctx.libs.builder.Embed() }
        try {
            obj.embeds[0].setDescription(`${interaction.options.getString(`description`, false)}`)
            embedCharacterCount = embedCharacterCount + interaction.options.getString(`description`, false).length
        } catch(e) { 
            return interaction.reply({
                content: `${ctx.emojis.fail} Invalid Description!`, 
                ephemeral: true
            }) 
        }
    } else if(interaction.options.getString(`description`, false)) return interaction.reply({ ephemeral: true, content: `${ctx.emojis.fail} Descriptions have a limit of **4096** characters!` })
    
    if(interaction.options.getString(`color`, false) && (interaction.options.getString(`color`, false).length === 6 || (interaction.options.getString(`color`, false).length === 7 && interaction.options.getString(`color`, false).startsWith(`#`)))) {
        if(!obj.embeds[0]) { obj.embeds[0] = new ctx.libs.builder.Embed() }
        console.log(interaction.options.getString(`color`, false))
        try {
            obj.embeds[0].setColor(ctx.utils.colors(interaction.options.getString(`color`, false)))
        } catch(e) { 
            return interaction.reply({
                content: `${ctx.emojis.fail} Invalid Color!`, 
                ephemeral: true
            }) 
        }
    } else if(interaction.options.getString(`color`, false)) return interaction.reply({ ephemeral: true, content: `${ctx.emojis.fail} Invalid Color! (HEX colors start with a \`#\` symbol, followed by 6 individual characters)` })
    
    if(interaction.options.getUser(`author`, false)) {
        if(!obj.embeds[0]) { obj.embeds[0] = new ctx.libs.builder.Embed() }
        try {
            obj.embeds[0].setAuthor({ 
                name: `${interaction.options.getUser(`author`, false).username}#${interaction.options.getUser(`author`, false).discriminator}`,
                iconURL: interaction.options.getUser(`author`, false).avatarURL({ format: `png`, size: 128 })
            })
        } catch(e) { 
            return interaction.reply({
                content: `${ctx.emojis.fail} Invalid Title!`, 
                ephemeral: true
            }) 
        }
    }
    
    if(interaction.options.getString(`thumbnail`, false)) {
        if(!obj.embeds[0]) { obj.embeds[0] = new ctx.libs.builder.Embed() }
        try {
            obj.embeds[0].setThumbnail(`${interaction.options.getString(`thumbnail`, false)}`)
        } catch(e) { 
            console.log(e)
            return interaction.reply({
                content: `${ctx.emojis.fail} Invalid Thumbnail URL!`, 
                ephemeral: true
            }) 
        }
    }
    
    if(interaction.options.getString(`image`, false)) {
        if(!obj.embeds[0]) { obj.embeds[0] = new ctx.libs.builder.Embed() }
        try {
            obj.embeds[0].setImage(`${interaction.options.getString(`image`, false)}`)
        } catch(e) { 
            return interaction.reply({
                content: `${ctx.emojis.fail} Invalid Image URL!`, 
                ephemeral: true
            }) 
        }
    }

    if(interaction.options.getString(`footer`, false)) {
        if(!obj.embeds[0]) { obj.embeds[0] = new ctx.libs.builder.Embed() }
        try {
            obj.embeds[0].setFooter({ text: interaction.options.getString(`footer`, false) })
            embedCharacterCount = embedCharacterCount + interaction.options.getString(`footer`, false).length
        } catch(e) { 
            return interaction.reply({
                content: `${ctx.emojis.fail} Invalid footer!`, 
                ephemeral: true
            }) 
        }
    }

    if(interaction.options.getString(`url`, false)) {
        if(!obj.embeds[0]) { obj.embeds[0] = new ctx.libs.builder.Embed() }
        try {
            obj.embeds[0].setURL(interaction.options.getString(`url`, false))
        } catch(e) { 
            return interaction.reply({
                content: `${ctx.emojis.fail} Invalid URL!`, 
                ephemeral: true
            }) 
        }
    }

    interaction.channel.send(obj).then(() => {
        interaction.reply({
            content: `${ctx.emojis.pass} Successfully sent the message!`, 
            ephemeral: true
        })
    }).catch(e => interaction.reply(ctx.errMsg(interaction, `I was unable to send the message! Please make sure that I have the proper permission!`, `Unable to send custom message`, e)))
}

module.exports = {
    func,
    interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
        .setDescription(`Have Nyx repeat something!`)
        .setDefaultPermission(true)
        .setDescription(`Send an embedded message!`)
        
        .addStringOption(o => {
            o.setName(`message`)
            o.setDescription(`Message content for Nyx to repeat`)
            o.setRequired(false);

            return o;
        })
        
        .addStringOption(o => {
            o.setName(`title`)
            o.setDescription(`The title of the embed`)
            o.setRequired(false);

            return o;
        })
        
        .addStringOption(o => {
            o.setName(`description`)
            o.setDescription(`The description of the embed`)
            o.setRequired(false);

            return o;
        })
        
        .addStringOption(o => {
            o.setName(`url`)
            o.setDescription(`The main URL of the embed`)
            o.setRequired(false);

            return o;
        })
        
        .addStringOption(o => {
            o.setName(`color`)
            o.setDescription(`The HEX color of the embed`)
            o.setRequired(false);

            return o;
        })
        
        .addUserOption(o => {
            o.setName(`author`)
            o.setDescription(`The author of the embed`)
            o.setRequired(false);

            return o;
        })
        
        .addStringOption(o => {
            o.setName(`thumbnail`)
            o.setDescription(`The small image's URL of the embed`)
            o.setRequired(false);

            return o;
        })
        
        .addStringOption(o => {
            o.setName(`image`)
            o.setDescription(`The main image's URL of the embed`)
            o.setRequired(false);

            return o;
        })
        
        .addStringOption(o => {
            o.setName(`footer`)
            o.setDescription(`The footer of the embed (the smaller text at the bottom)`)
            o.setRequired(false);

            return o;
        })
}
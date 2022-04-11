moduleFind = (module, interaction, func) => {
    const mod = global.ctx.modules[module];
    const moduleArray = Object.keys(global.ctx.modules)
    const pos = moduleArray.indexOf(module.toLowerCase())
    
    const embed = new ctx.libs.builder.Embed()
    embed.setTitle(`${mod.emoji} **${mod.friendlyName}** [${Object.keys(mod.commands).length} command${Object.keys(mod.commands).length === 1 ? `` : `s`}]`)
    
    embed.setDescription(`\`` + Object.values(global.ctx.modules).map(m => m.friendlyName).join(`\`  \``).replace(`\`${mod.friendlyName}\``, `__\`${mod.friendlyName}\`__`) + `\`` + `\n${mod.description}\n`)
    
    if(mod.systemModule) embed.setDescription(embed.description + `\n:tools: System Module`)
    
    embed.setColor(ctx.utils.colors('random'))

    for (c of Object.keys(mod.commands)) {
        const cmd = mod.commands[c];

        // interaction types: https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type

        embed.addField({
            name: `**${ctx.emojis.command.slash}${cmd.name}**`,
            value: cmd.description,
            inline: true
        });
    };

    embed.setFooter({
        text: `Module  ${pos+1} / ${moduleArray.length}`
    });

    return interaction[func]({
        content: `Help for module **${mod.friendlyName}**`,
        embeds: [embed],
        components: [
            new ctx.libs.builder.MessageActionRow().addComponents(
                new ctx.libs.Discord.MessageSelectMenu()
                .setCustomId(`selector`)
                .addOptions(...moduleArray.map(m => {
                    console.log(m, ctx.modules[m].description)
                    return {
                        label: ctx.modules[m].friendlyName,
                        value: m.toLowerCase(),
                        description: `${ctx.modules[m].description}`.substring(0, 99),
                        emoji: `${ctx.modules[m].emoji}`,
                        default: m.toLowerCase() == module.toLowerCase() ? true : false
                    }
                }))
            )
        ],
        ephemeral: true,
    })
}

const buttonFunc = interaction => moduleFind(interaction.values[0].toLowerCase(), interaction, `update`)

const func = async (interaction) => {
    const module = interaction.options.getString(`module`, false)
    
    if(module) {
        moduleFind(module, interaction, `reply`)
    } else {
        let resources = [
            [`:blue_book:`, `Documentation`, `https://docs.nyx.bot`],
            [`:notepad_spiral:`, `Commands`, `https://docs.nyx.bot/commands`],
            [`:floppy_disk:`, `Uptime`, `https://status.nyx.bot/`],
            [`:grey_question:`, `Support / Feedback`, `https://nyx.bot/server`],
            [`:globe_with_meridians:`, `Website`, `https://nyx.bot/`],
            [`<:twitter:712402650435420285>`, `Twitter`, `https://twitter.com/nyxdisc`],
            [`:shield:`, `Privacy Policy`, `https://nyx.bot/privacy`],
            [`<:patreon:750461829985337435>`, `nyxSupporter <:nyxSupporter:702273579362025582>`, `https://www.patreon.com/NyxBot`],
        ];

        interaction.reply({
            ephemeral: true,
            embeds: [
                new ctx.libs.builder.Embed()
                .setTitle(`Help`)
                .addField({
                    name: `**Resources**`,
                    value: resources.map(r => `${r[0]} [**${r[1]}**](${r[2]})`).join(`\n`)
                })
                .setColor(ctx.utils.colors(`random`))
            ]
        })
    }
}

module.exports = {
    func,
    buttonFunc,
    interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
    .setDescription(`See help for Nyx, how to use specific commands, or a rundown on an individual module!`)
    .addStringOption(s => {
        s.setName(`module`)
        s.setDescription(`View the status, a list of commands, or an individual command's help in a certain module`)

        for (m of require('fs').readdirSync(`./core/commandHandler/cmdModules`)) {
            s.addChoice(m[0].toUpperCase() + m.slice(1), m)
        }

        s.setRequired(false);

        return s;
    })
}
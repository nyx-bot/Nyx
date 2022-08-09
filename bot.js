const fs = require('fs');

global.ctx = {
    ready: false,
    libs: {
        builder: {
            ...require('@discordjs/builders'),
            MessageActionRow: require('discord.js').MessageActionRow,
            MessageButton: require('discord.js').MessageButton,
        },
        ffprobe: require('ffprobe-client'),
        Discord: require('discord.js')
    },
    utils: {
        colors: require('./util/nyxColors'),
        escape: require('./util/discordMarkdownEscape'),
        idGen: require('./util/idGen'),
        time: require('./util/time'),
        getPronouns: require('./util/getPronouns'),
        owoify: require('./util/owoify')
    },
    config: require('./config.json'),
    emojis: require('./config/emojis'),
    activeInteractions: {
        // this object will be used primarily for button interactions
    },
}; global.ctx.bot = require('./client/discord');

if(!fs.existsSync(`config.json`)) {
    if(fs.existsSync(`config.example.json`)) {
        fs.cpSync(`config.example.json`, `config.json`);
        console.error(`You do not have a config.json set up! The example JSON has been copied to "config.json"; please edit the file accordingly!`);
        process.exit(1)
    } else {
        console.error(`You do not have a config.json set up! The example JSON does NOT exist in this directory; please ensure the repository has not been modified locally, or manually download the configuration from the hosted repo, and try again!`);
        process.exit(1)
    }
}

const createDiscordClient = async () => new Promise(async res => {
    global.ctx.bot.login();

    global.ctx.bot.on(`ready`, () => ctx.ready = true)

    let interactionCache = {}

    global.ctx.bot.on(`interactionCreate`, async interaction => {
        if(!interactionCache[interaction.id]) {
            interactionCache[interaction.id] = true;

            const isCommand = interaction.isCommand() ? `COMMAND` : null;
            const isButton = interaction.isButton() || interaction.isSelectMenu() ? `BUTTON` : null;

            let type = `Discord`;
            switch (interaction.type) {
                case 2: type = `Command`;
                case 4: type = `CommandAutocomplete`;
                case 3: type = `MessageComponent`;
                case 5: type = `ModalSubmit`;
                case 1: type = `Ping`
            }

            let log = `[${(isCommand ? isCommand + ` ` : ``) + (isButton ? isButton + ` ` : ``) + type.toUpperCase()} INTERACTION]`;
            if(interaction.guild) log = log + `\n| Guild ID: ${interaction.guild.id || interaction.guildId}`;
            if(interaction.channel) log = log + `\n| Channel ID: ${interaction.channel.id || interaction.channelId}`
            if(interaction.user) log = log + `\n| User ID: ${interaction.user.id}`;

            let response;

            if(isButton) response = await require('./core/commandHandler/button')(interaction);
            if(isCommand) response = await require('./core/commandHandler/command')(interaction);

            if(response) {
                if(typeof response == `object` && response.name && typeof response.name == `string`) log = log + `\n| > Command Recognized: ${response.name}`;
                if(typeof response == `object` && response.description && typeof response.description == `string`) log = log + `\n| > ${response.description}`
                if(typeof interaction == `object` && typeof interaction.component == `object` && interaction.component.customId) log = log + `\n| > Button Pressed: ${interaction.component.customId}`

                console.log(log);
            }

            setTimeout(() => {try {delete interactionCache[interaction.id]} catch(e) {}}, 5000)
        }
    })
})

// import every "core" module. each index file must be its own function.
// every other defined function above here is called by another function, so core modules will ALWAYS import first.

// note that core modules are always imported synchronously, so Nyx will not wait for one module before importing another.

for (let module of fs.readdirSync(`./core/`).sort()) {
    if(!global.ctx.initialized) global.ctx.initialized = true;
    (console.l || console.log)(`Importing module "${module}"`);
    
    if(fs.existsSync(`./core/${module}/`) && fs.existsSync(`./core/${module}/index.js`)) {
        (require(`./core/${module}/index.js`))()
    } else if(module.endsWith(`.js`)) {
        (require(`./core/${module}`))()
    } else {
        (console.e || console.error)(`${module} does not have an index.js file, or is not its own JS file! skipping...`)
    }
};

createDiscordClient();
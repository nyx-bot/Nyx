const config = require('./config.json');

const Sharder = require('eris-sharder').Master;

global.manager = new Sharder(config.token, `/client.js`, {
    stats: true,
    name: `Nyx`,
    clientOptions: {
        maxShards: "auto",
        compress: true,
        defaultImageFormat: "png",
        defaultImageSize: 512,
        ratelimiterOffset: 175,
        autoreconnect: true,
        maxResumeAttempts: 2,
        allowedMentions: {
            everyone: false,
            roles: false,
            replied_user: false,
        },
        intents: [
            "allNonPrivileged",
            "guildMessages",
            "guildMessageReactions",
            "guildMessageTyping",
            "guildMembers",
        ],
        guildSubscriptions: true,
    }
})
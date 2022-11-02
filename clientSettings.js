const { IntentsBitField } = require('discord.js')

module.exports = new (require('discord.js-cluster').Client)({
    failIfNotExists: false,
    intents: new IntentsBitField([
        `DirectMessageReactions`,
        `DirectMessageTyping`,
        `DirectMessages`,
        `GuildIntegrations`,
        `GuildInvites`,
        `GuildMembers`,
        `GuildMessages`,
        `GuildMessageReactions`,
        `GuildMessageTyping`,
        `GuildWebhooks`,
        `MessageContent`,
        `GuildVoiceStates`,
        `Guilds`
    ]).bitfield,
    presence: {
        status: `online`,
        activities: [
            {
                name: `/help`,
                type: `Watching`
            }
        ]
    },
    allowedMentions: {
        repliedUser: true,
        roles: [],
        users: []
    }
})

const Eris = require("eris");
new Eris(require("./config.json").token, {
    //maxShards: 2,
    maxShards: "auto", // turns out that is the maxshards amount is higher than previous count, it will spawn a new one along with existing if restarting from cached client.
    compress: true,
    defaultImageFormat: "png",
    defaultImageSize: 512,
    ratelimiterOffset: 175,
    autoreconnect: true,
    maxResumeAttempts: 2,
    //getAllUsers: true,
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
    //disableEvents: {
    //    TYPING_START: true
    //},
    guildSubscriptions: true,
});

const { Client } = require("oceanic.js");

const opt = {
    defaultImageFormat: "png",
    defaultImageSize: 512,
    //ratelimiterOffset: 175,
    //maxResumeAttempts: 2,
    allowedMentions: {
        everyone: false,
        roles: false,
        replied_user: false,
    },
    gateway: {
        //getAllUsers: true,
        //compress: true
        autoReconnect: true,
        intents: [
            "GUILDS",
            "GUILD_MEMBERS",
            "GUILD_MODERATION",
            "GUILD_EMOJIS_AND_STICKERS",
            "GUILD_INTEGRATIONS",
            "GUILD_WEBHOOKS",
            "GUILD_INVITES",
            "GUILD_VOICE_STATES",
            //"GUILD_MESSAGE_TYPING",
            "DIRECT_MESSAGES",
            "GUILD_MESSAGES",
            "MESSAGE_CONTENT"
        ]
    },
    //guildSubscriptions: true,
    auth: require("./config.json").token
}

module.exports = {
    client: new Client(opt),
    rest: new Client(Object.assign({}, opt, {rest: true}))
};

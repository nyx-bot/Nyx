const { Client } = require(`oceanic.js`);

const config = require(`./config.json`)

module.exports = new Client({
    auth: config.token,
    defaultImageFormat: "png",
    defaultImageSize: 512,
    allowedMentions: {
        everyone: false,
        roles: false,
        replied_user: false,
    },
    gateway: {
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
            "GUILD_MESSAGE_TYPING",
            "DIRECT_MESSAGES",
            "DIRECT_MESSAGE_REACTIONS",
            "DIRECT_MESSAGE_TYPING",
            "GUILD_MESSAGES",
            "MESSAGE_CONTENT"
        ]
    },
})
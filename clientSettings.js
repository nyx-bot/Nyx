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
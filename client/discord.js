const Discord = require('discord.js')

const activities = require(`../config/activities`)

const pickedStartingActivity = activities.starting[Math.floor(Math.random() * activities.starting.length)]
console.log(pickedStartingActivity)

module.exports = require('../util/hijackEvents')(new Discord.Client({
    //shards: 2,
    invalidRequestWarningInterval: 0,
    failIfNotExists: false,
    presence: {
        afk: true,
        activities: [pickedStartingActivity],
        status: `idle`
    },
    partials: [
        `MESSAGE`,
        `CHANNEL`,
        `REACTION`
    ],
    intents: [ 
        `GUILDS`, 
        `GUILD_MEMBERS`, 
        `GUILD_BANS`, 
        `GUILD_EMOJIS_AND_STICKERS`, 
        `GUILD_INTEGRATIONS`, 
        `GUILD_WEBHOOKS`, 
        `GUILD_INVITES`, 
        `GUILD_MESSAGES`, 
        `GUILD_MESSAGE_REACTIONS`, 
        `GUILD_MESSAGE_TYPING` 
    ]
}), `discordClient`)
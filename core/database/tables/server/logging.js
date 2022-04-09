const { Sequelize, Model, DataTypes } = require('sequelize');

const defaultModuleConfig = {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
}

module.exports = {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: `-1`
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    webhookURL: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: `https://discord.com/api/webhooks/ID/token`
    },

    // types of logs here:

    messages: defaultModuleConfig,
    channels: defaultModuleConfig,
    invites: defaultModuleConfig,
    members: defaultModuleConfig,
    moderation: defaultModuleConfig,
    roles: defaultModuleConfig,
    commands: defaultModuleConfig,
}
const { Sequelize, Model, DataTypes } = require('sequelize');

module.exports = {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: `-1`
    },
    messageID: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: `0`
    },
    emojiID: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: false,
    },
    roleID: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: `0`
    },
}
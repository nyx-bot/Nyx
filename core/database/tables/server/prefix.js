const { Sequelize, Model, DataTypes } = require('sequelize');

module.exports = {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: `-1`
    },
    prefix: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: `;`,
    }
}
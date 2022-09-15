const { Sequelize, Model, DataTypes } = require('sequelize');

module.exports = {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: `-1`
    },
    
    subjective: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: `they`,
    },
    objective: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: `them`,
    },
    posessive: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: `their`,
    },
    singular: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: `they`,
    },
}
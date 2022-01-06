"use strict";

const Sequelize = require("sequelize");
const db = require("../database/database").postgres;

let modelDefinition = {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    user_id: {
        type: Sequelize.UUID,
        references: { model: "users", key: "id" },
        allowNull: true
    },
    client_id: {
        type: Sequelize.STRING,
        allowNull: true
    },
    token: {
        type: Sequelize.STRING,
        allowNull: true
    },
    scope: {
        type: Sequelize.STRING,
        allowNull: true
    },
    expiry_date: {
        type: Sequelize.DATE,
        allowNull: true
    },
    createdAt: {
        allowNull: false,
        type: Sequelize.DATE
    },
    updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
    }
};

let modelOptions = {
    tableName: "access_token"
};

let accessTokenModel = db.define("access_token", modelDefinition, modelOptions);

module.exports = accessTokenModel;

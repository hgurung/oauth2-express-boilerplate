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
        type: Sequelize.INTEGER,
        references: {
            model: "users",
            key: "id",
            deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
            onDelete: "CASCADE"
        },
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
    tableName: "refresh_token"
};

let refreshTokenModel = db.define("refresh_token", modelDefinition, modelOptions);

module.exports = refreshTokenModel;

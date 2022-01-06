"use strict";

const Sequelize = require("sequelize");
const { generateRandomString } = require("../common/helper");
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
    token: {
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
    hooks: {
        beforeCreate:generateToken
    },
    tableName: "password_reset"
};

let passwordResetModel = db.define("password_reset", modelDefinition, modelOptions);

async function generateToken(PasswordReset) {
    PasswordReset.token = generateRandomString(5);
}

module.exports = passwordResetModel;

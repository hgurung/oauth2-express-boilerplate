"use strict";

const Sequelize = require("sequelize");
const db = require("../database/database").postgres;
const bcrypt = require("bcryptjs");

let modelDefinition = {
    id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
    },
    username: {
        type: Sequelize.STRING,
        allowNull: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true
    },
    role: {
        type: Sequelize.STRING,
        allowNull: true
    },
    fullname: {
        type: Sequelize.STRING,
        allowNull: true
    },
    createdAt: {
        allowNull: false,
        type: Sequelize.DATE
    },
    updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
    },
    deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
    },
    last_login: {
        type: Sequelize.DATE,
        defaultValue: null
    }
};

let modelOptions = {
    hooks: {
        beforeCreate:generateRandomPassword
    }
};

let usersModel = db.define("users", modelDefinition, modelOptions);

async function generateRandomPassword(Users) {
    Users.password = bcrypt.hashSync("User123", 10);
}

module.exports = usersModel;
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
    title: {
        type: Sequelize.STRING
    },
    client_id: {
        type: Sequelize.STRING,
        allowNull: true
    },
    client_secret: {
        type: Sequelize.STRING,
        allowNull: true
    },
    grants: {
        type: Sequelize.STRING,
        allowNull: true
    },
    server_access: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2
    },
    permissions: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
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
        beforeCreate:hashClientNsecret
    }
};

let clientModel = db.define("clients", modelDefinition, modelOptions);

async function hashClientNsecret(Client) {
    Client.client_id = generateRandomString(10);
    Client.client_secret = generateRandomString(64);
}

module.exports = clientModel;

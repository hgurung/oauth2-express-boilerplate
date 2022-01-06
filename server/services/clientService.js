const _ = require("lodash");
const Boom = require("@hapi/boom");
const Service = require("../model/serviceModel");
const clientModel = require("../models/Client");
const {
    PERMISSION
} = require("../common/constant");

module.exports = class ClientService extends Service {
    constructor() {
        super();
    }

    // Get individual client data api
    async getClientData(clientId) {
        const clientData = await this.getClientByClientId(clientId);
        if (!clientData) {
            throw Boom.badRequest("Client was not found");
        }
        return this.parseClientData(clientData);
    }

    // Delete client by client id
    async deleteClientData(clientId) {
        const clientData = await this.getClientByClientId(clientId);
        if (!clientData) {
            throw Boom.badRequest("Client was not found");
        }
        try {
            const isDeleted = await clientModel.destroy({where: {client_id: clientId }});
            if (isDeleted) {
                return true;
            }
        } catch (err) {
            throw Boom.badRequest("Cannot delete client. Please try again later.", err);
        }
    }

    // Get client by client_id
    async getClientByClientId(clientId) {
        if (!clientId) {
            throw Boom.badRequest("Missing parameters");
        }
        return clientModel.findOne({where: {client_id: clientId}})
            .then(results => this.promise.resolve(results))
            .catch(err => {
                console.log("err", err);
                this.promise.resolve(false);
            });
    }

    // Get client by title
    async getClientByTitle(title) {
        if (!title) {
            throw Boom.badRequest("Missing parameters");
        }
        return clientModel.findOne({where: {title}})
            .then(results => this.promise.resolve(results))
            .catch(err => {
                console.log("err", err);
                this.promise.resolve(false);
            });
    }

    async createClient({title, permissions}) {
    // Create User
        try {
            // Check if permission is valid from constant defined in system PERMISSION constant
            let isFound = true;
            permissions.forEach((permission) => {
                isFound = _.find(PERMISSION, {id: permission});
                if (!isFound) {
                    return;
                }
            });
            if (!isFound) {
                throw Boom.badRequest("Invalid permissions value");
            }
            const clientData = await clientModel.create({title, permissions});
            return this.parseClientData(clientData);
        } catch(err) {
            console.log("err", err);
            throw Boom.badRequest("Error creating clients. Please try again later.", err);
        }
    }

    async updateClientPermission(clientId, {title, permissions}) {
    // Update client permission
        if (!clientId) {
            throw Boom.badRequest("Missing parameters");
        }
        const clientData = await this.getClientByClientId(clientId);
        if (!clientData) {
            throw Boom.badRequest("Client was not found");
        }
        // Check if permission is valid from constant defined in system PERMISSION constant
        let isFound = true;
        permissions.forEach((permission) => {
            isFound = _.find(PERMISSION, {id: permission});
            if (!isFound) {
                return;
            }
        });
        try {
            if (!isFound) {
                throw Boom.badRequest("Invalid permissions value");
            }
            const clientUpdate = await clientModel.update({title, permissions}, { where: { id: clientData.id }, individualHooks: true });
            if (clientUpdate) {
                return this.parseClientDataWithPermission({title, permissions, clientId});
            }
            throw Boom.badRequest("Error updating client permission. Please try again later.");
        } catch(err) {
            throw Boom.badRequest("Error updating client permission. Please try again later.", err);
        }
    }

    parseClientData(client) {
        const std = client;
        return _.pick(std, [
            "title",
            "permissions",
            "client_id",
            "client_secret"
        ]);
    }

    parseClientDataWithPermission(client) {
        const std = client;
        return _.pick(std, [
            "title",
            "permissions",
            "client_id"
        ]);
    }
};

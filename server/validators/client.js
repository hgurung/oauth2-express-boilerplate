const { checkSchema } = require("express-validator");

const ClientService = require("../services/clientService");
const clientService = new ClientService();
const clientAddValidation = checkSchema({
    title: {
        isLength: {
            errorMessage: "Title must be between 2 to 30",
            options: {
                min: 2,
                max: 30
            }
        },
        custom: {
            options: value => {
                const re = /^[a-zA-Z0-9 ]*$/;
                if (!re.test(String(value))) {
                    throw new Error("Must only contain alphabets, number and dash.");
                }
                return clientService.getClientByTitle(value).then(client => {
                    if (client) {
                        throw new Error("Title already exists");
                    }
                    return true;
                });
            }
        }
    },
    permissions: {
        isArray: {
            errorMessage: "Permissions must be array type",
            options: {
                min: 1,
                max: 20
            }
        },
        custom: {
            options: value => {
                const re = /^[a-zA-Z_, ]*$/;
                if (re.test(String(value))) {
                    return true;
                }
                throw new Error("Must only contain alphabets, underscore or comma.");
            }
        }
    }
});

const updateClientValidation = checkSchema({
    title: {
        isLength: {
            errorMessage: "Title must be between 2 to 30",
            options: {
                min: 2,
                max: 30
            }
        },
        custom: {
            options: (value, { req }) => {
                const re = /^[a-zA-Z0-9 ]*$/;
                if (!re.test(String(value))) {
                    throw new Error("Must only contain alphabets, number and dash.");
                }
                const clientId = req.params.id;
                return clientService.getClientByTitle(value).then(client => {
                    if (client && client.client_id !== clientId) {
                        throw new Error("Title already exists");
                    }
                    return true;
                });
            }
        }
    },
    permissions: {
        isArray: {
            errorMessage: "Permissions must be array type",
            options: {
                min: 1,
                max: 20
            }
        },
        custom: {
            options: value => {
                const re = /^[a-zA-Z_, ]*$/;
                if (re.test(String(value))) {
                    return true;
                }
                throw new Error("Must only contain alphabets, underscore or comma.");
            }
        }
    }
});

module.exports = {
    clientAddValidation,
    updateClientValidation
};

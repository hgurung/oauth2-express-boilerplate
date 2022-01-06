const {
    clientAddValidation,
    updateClientValidation
} = require("../validators/client");
const { wrapAsync, validate } = require("../middlewares");
const ClientService = require("../services/clientService");
const Controller = require("../model/controllerModel");
const { checkServerAccess } = require("../middlewares");

module.exports = class clientController extends Controller {
    constructor(passport) {
        super();
        this.clientService = new ClientService();
        this.passport = passport;
        const basicAuth = this.passport.authenticate(["basic"], { session: false});
        this.router.post("/register", basicAuth, checkServerAccess([1]), clientAddValidation, validate, wrapAsync(this.createClient.bind(this)));
        this.router.get("/:id", basicAuth, checkServerAccess([1]), wrapAsync(this.getClientData.bind(this)));
        this.router.put("/:id", basicAuth, checkServerAccess([1]), updateClientValidation, validate, wrapAsync(this.updateClientPermission.bind(this)));
        this.router.delete("/:id", basicAuth, checkServerAccess([1]), wrapAsync(this.deleteClientData.bind(this)));
    }
  
    async getClientData(req, res) {
        return this.clientService.getClientData(req.params.id).then(success => {
            res.status(200).send(success);
        });
    }

    async createClient(req, res) {
        return this.clientService.createClient(req.body).then(success => {
            res.status(201).send(success);
        });
    }
  
    async updateClientPermission(req, res) {
        return this.clientService.updateClientPermission(req.params.id, req.body).then(success => {
            res.status(200).send(success);
        });
    }

    async deleteClientData(req, res) {
        return this.clientService.deleteClientData(req.params.id).then(success => {
            res.status(200).send(success);
        });
    }
};
  
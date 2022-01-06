const {
    userAddValidation,
    updatePasswordValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    updateUserValidation,
} = require("../validators/user");
const { wrapAsync, validate, checkServerAccess } = require("../middlewares");
const UserService = require("../services/userService");
const Controller = require("../model/controllerModel");

module.exports = class userController extends Controller {
    constructor(passport) {
        super();
        this.userService = new UserService();
        this.passport = passport;
        const basicAuth = this.passport.authenticate(["basic"], { session: false, state: 1 });
        const bearerAuth = this.passport.authenticate("bearer", { session: false });
        this.router.post("/register", basicAuth, checkServerAccess([1]), userAddValidation, validate, wrapAsync(this.createUser.bind(this)));
        this.router.post("/update-password", basicAuth, checkServerAccess([1]), updatePasswordValidation, validate, wrapAsync(this.updateUserPassword.bind(this)));
        // Validate password token
        this.router.get("/validate-token", basicAuth, checkServerAccess([1, 2]), validate, wrapAsync(this.validatePasswordToken.bind(this)));
        // Forgot password
        this.router.post("/forgot-password", basicAuth, checkServerAccess([1,2]), forgotPasswordValidation, validate, wrapAsync(this.forgotPassword.bind(this)));
        // Reset password
        this.router.post("/reset-password", basicAuth, checkServerAccess([1, 2]), resetPasswordValidation, validate, wrapAsync(this.resetPassword.bind(this)));
        // Update email api
        this.router.put("/update-user/:id", basicAuth, checkServerAccess([1]), updateUserValidation, validate, wrapAsync(this.updateUser.bind(this)));
        // Update role api
        this.router.delete("/:id", basicAuth, checkServerAccess([1]), wrapAsync(this.deleteUser.bind(this)));
    }

    async createUser(req, res) {
        return this.userService.createUser(req.body).then(success => {
            res.status(201).send(success);
        });
    }

    async updateUser(req, res) {
        return this.userService.updateUser(req.params.id, req.body).then(success => {
            res.status(200).send(success);
        });
    }

    async deleteUser(req, res) {
        return this.userService.deleteUser(req).then(success => {
            res.status(200).send(success);
        });
    }

    async updateUserPassword(req, res) {
        return this.userService.updateUserPassword(req.user, req.body).then(success => {
            res.status(200).send(success);
        });
    }

    async validatePasswordToken(req, res) {
        return this.userService.validatePasswordToken(req.query).then(success => {
            res.status(200).send(success);
        });
    }

    async forgotPassword(req, res) {
        return this.userService.forgotPassword(req.body).then((result) => {
            res.status(200).send(result);
        });
    }

    async changePasswordEmail(req, res) {
        return this.userService.changePasswordEmail(req.body).then((result) => {
            res.status(200).send(result);
        });
    }

    async resetPassword(req, res) {
        return this.userService.resetPassword(req.body).then(() => {
            res.status(201).send({ success: "Password changed successfully." });
        });
    }
};

const _ = require("lodash");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const Boom = require("@hapi/boom");
const Service = require("../model/serviceModel");
const userModel = require("../models/Users");
const AuthService = require("../services/authService");

const passwordResetModel = require("../models/PasswordReset");
const {
    ERROR_NOT_FOUND,
    ERROR_SERVER_ERROR
} = require("../common/constant");

module.exports = class UserService extends Service {
    constructor() {
        super();
        this.authService = new AuthService();
    }  

    async forgotPassword(body) {
        const username = body.username;
        if (!username) {
            const errMsg = "Cannot reset password. Missing username.";
            const err = {
                username: {
                    param: "username",
                    location: "body",
                    msg: errMsg
                },
            };
            throw Boom.badRequest(errMsg, { err });
        }
        const user = await this.getUserByUsername(username);
        if (!user) {
            throw new Boom.Boom("User was not found", {
                statusCode: 401,
                data: { errorCode: ERROR_NOT_FOUND }
            });
        }
        const expirationDate = moment().add(process.env.VERIFICATION_EXPIRATION_DAYS || 3, "days").format("YYYY-MM-DD HH:mm:ss");
        const resetData = {
            user_id: user.id,
            expiry_date: expirationDate
        };
        const result = await passwordResetModel.create(resetData);
        if (result) {
            return {
                token: result.token
            };
        }
        throw Boom.forbidden("Internal Server Error", { errorCode: ERROR_SERVER_ERROR });
    }

    async changePasswordEmail(body) {
        const username = body.username;
        const user = await this.getUserByUsername(username);
        if (!user) {
            throw new Boom.Boom("User was not found", {
                statusCode: 401,
                data: { errorCode: ERROR_NOT_FOUND }
            });
        }
        const expirationDate = moment().add(process.env.VERIFICATION_EXPIRATION_DAYS || 3, "days").format("YYYY-MM-DD HH:mm:ss");
        const resetData = {
            user_id: user.id,
            expiry_date: expirationDate
        };
        const result = await passwordResetModel.create(resetData);
        if (result) {
            return {
                token: result.token
            };
        }
        throw Boom.forbidden("Internal Server Error", { errorCode: ERROR_SERVER_ERROR });
    }

    async resetPassword({ token, password }) {
    // Now Find passcode with user
        const passwordResetData = await this.validateToken(token);
        if(!passwordResetData) {
            throw new Boom.Boom("Invalid passcode or your passcode has been expired.", {
                statusCode: 401,
                data: { errorCode: ERROR_NOT_FOUND }
            });
        }
        // Get User from passcode 
        const userData = await this.getUserById(passwordResetData.user_id);
        if (!userData) {
            throw new Boom.Boom("User was not found.", {
                statusCode: 401,
                data: { errorCode: ERROR_NOT_FOUND }
            });
        }
        try {
            const resetData = {
                password: bcrypt.hashSync(password, 10)
            };
            const userUpdate = await userModel.update(resetData, { where: { id: userData.id }, individualHooks: true });
            if (userUpdate) {
                // Delete password reset token
                await passwordResetModel.destroy({where: {id: passwordResetData.id }});
                return true;
            }
            throw Boom.badRequest("Error updating user password. Please try again later.");
        } catch(err) {
            console.log("err", err);
            throw Boom.badRequest("Error updating user password. Please try again later.");
        }
    }

    async validatePasswordToken({ token }) {
        if (!token) {
            const errMsg = "Token is required.";
            const err = {
                token: {
                    param: "token",
                    location: "query",
                    msg: errMsg
                }
            };
            throw Boom.badRequest(errMsg, { err });
        }
        const passwordResetData = await this.validateToken(token);
        if(!passwordResetData) {
            throw new Boom.Boom("Invalid passcode or your passcode has been expired.", {
                statusCode: 401,
                data: { errorCode: ERROR_NOT_FOUND }
            });
        } else {
            return true;
        }
    }

    async validateToken(token) {
        const passwordResetData = await this.getPasswordResetData(token);
        if (!passwordResetData || passwordResetData === null) {
            return false;
        }
        // Check for expiry date
        const currentDate = moment();
        const expiryDate = moment(passwordResetData.expiry_date);
        if (currentDate.isAfter(expiryDate)) {
            return false;
        }
        return passwordResetData;
    }

    async getUserByUsername(username) {
        if (!username) {
            throw Boom.badRequest("Missing parameters");
        }
        let data =  await userModel.findOne({where: {username: username,deleted_at: null}});
        return data;
    }

    // Get profile details
    async getProfile(authInfo) {
        const userId = authInfo.user_id;
        if (!userId) {
            throw Boom.badRequest("Not authorized");
        }
        try {
            const userData = await this.getUserById(userId);
            return this.parseUserData(userData);
        } catch (err){
            this.promise.reject({ code: 401, message: "Not authorized", error: err });
        }
    }

    // Get user by id
    async getUserById(userId) {
        if (!userId) {
            throw Boom.badRequest("Missing parameters");
        }
        return userModel.findOne({where: {id: userId}})
            .then(results => this.promise.resolve(results))
            .catch(err => {
                console.log("err", err);
                this.promise.resolve(false);
            });
    }

    async getPasswordResetData(token) {
        if (!token) {
            throw Boom.badRequest("Missing parameters");
        }
        let passwordResetData =  await passwordResetModel.findOne({
            where:{
                token:token
            }
        });
        // Now get latest token for that user
        if (passwordResetData) {
            let latestPasswordResetData =  await passwordResetModel.findOne({
                where:{
                    user_id:passwordResetData.user_id
                },
                order: [["created_at", "desc"]],
            });
            if(latestPasswordResetData && latestPasswordResetData.token === passwordResetData.token) {
                return passwordResetData;
            } else {
                return null;
            }
        }
        return passwordResetData;
    }

    async createUser(User) {
    // Create User
        try {
            const expirationDate = moment().add(process.env.VERIFICATION_EXPIRATION_DAYS || 3, "days").format("YYYY-MM-DD HH:mm:ss");
            const thirdPartyUserData = await userModel.create(User);
            let passwordResetToken = {
                user_id:thirdPartyUserData.id,
                expiry_date:expirationDate
            };
            let passwordResetData =  await passwordResetModel.create(passwordResetToken);
            return {
                "token":passwordResetData.token,
                "id":thirdPartyUserData.id
            };
        } catch(err) {
            console.log("err", err);
            throw Boom.badRequest("Error creating user. Please try again later.");
        }
    }

    async deleteUser(req) {
        let userId = req.params.id;
        this.isUUID(userId);
        const userData = await this.getUserById(userId);
        if (!userData) {
            throw new Boom.Boom("Associated user was not found.", {
                statusCode: 401,
                data: { errorCode: ERROR_NOT_FOUND }
            });
        }
        if (userData.deleted_at != null) {
            throw new Boom.Boom("Already deleted this user.", {
                statusCode: 403,
                data: { errorCode: ERROR_NOT_FOUND }
            });
        }
        let deletedAt = moment();
        let updateData = {deleted_at:deletedAt};
        await userModel.update(updateData, { where: { id: userId }, individualHooks: true });
        return {"message":"Deleted Successfully"};
    }


    isUUID(uuid) {
        let s = "" + uuid;

        s = s.match("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");
        if (s === null) {
            throw Boom.forbidden("Wrong UUID");
        }
        return true;
    }


    async updateUser(userId, body) {
        const username = body.username;
        // Update User
        try {
            // Get user first by id
            const userData = await this.getUserById(userId);
            if (!userData) {
                throw new Boom.Boom("Associated user was not found.", {
                    statusCode: 401,
                    data: { errorCode: ERROR_NOT_FOUND }
                });
            }
            const userName = await this.getUserByUsername(username);
            if (userName && userName.id !== userData.id) {
                const errMsg = "This username has already been taken.";
                const err = {
                    username: {
                        param: "username",
                        location: "body",
                        msg: errMsg
                    }
                };
                throw Boom.badRequest(errMsg, { err });
            }    
            let updateData = {
                username
            };
            const userUpdate = await userModel.update(updateData, { where: { id: userId }, individualHooks: true });
            if (userUpdate) {
                const userData = await this.getUserById(userId);
                return this.parseUserData(userData);
            }
            throw Boom.badRequest("Error updating user email. Please try again later.");
        } catch(err) {
            console.log("err", err);
            throw Boom.badRequest(err);
        }
    }

    async updateUserPassword(clientsData, User) {
    // Update user passwrod
        try {
            const updateData = {
                password: bcrypt.hashSync(User.password, 10)
            };
            let userUpdate; 
            userUpdate = await userModel.update(updateData, { where: { username: User.username, deleted_at: null }, individualHooks: true });
            if (userUpdate) {
                // Get User by username and remove all access token and refresh token
                // Remove all credentials related to particular user which is access token and refresh token
                let userData =  await userModel.findOne({where: whereQuery });
                if (userData) {
                    this.authService.removeAccessTokenByClientUser(userData.id, clientsData.client_id);
                }
                return true;
            } else {
                throw Boom.badRequest("Error updating user password. Please try again later.");
            }
        } catch(err) {
            console.log("err", err);
            throw Boom.badRequest("Error updating user password. Please try again later.");
        }
    }

    // Change password 
    async changePassword(authInfo, body) {
    // Check old password with body password
        const { oldPassword, password } = body;
        const userId = authInfo.user_id;
        try {
            const userData = await this.getUserById(userId);
            // Check old password matches current user password
            const matched = await this.compareAsync(oldPassword, userData.password);
            if (!matched) {
                throw Boom.badData("Old password does not match");
            } else {
                const updateData = {
                    password: bcrypt.hashSync(password, 10)
                };
                const userUpdate = await userModel.update(updateData, { where: { id: userId}, individualHooks: true });
                if (userUpdate) {
                    return { "message": "Password was successfully changed" };
                } else {
                    throw Boom.badRequest("Error updating user password. Please try again later.");
                }
            }
        } catch (err){
            throw Boom.badData(err.message);
        }
    }

    compareAsync(param1, param2) {
        return new Promise(function(resolve, reject) {
            bcrypt.compare(param1, param2, function(err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }


    parseUserData(user) {
        const std = user;
        return _.pick(std, [
            "id",
            "username",
            "fullname",
        ]);
    }
};

const Boom = require("@hapi/boom");
const Service = require("../model/serviceModel");
const clientModel = require("../models/Client");
const accessTokenModel = require("../models/AccessToken");
const refreshTokenModel = require("../models/RefreshToken");
const { calculateExpirationDate } = require("../utils");

module.exports = class AuthService extends Service {
    constructor() {
        super();
    }

    async logOut(authInfo) {
        const userId = authInfo.user_id;
        const clientId = authInfo.client_id;
        return this.removeAccessTokenByClientUser(userId, clientId);
    }

    async generateTokens(authCode) {
        return Promise.all([this.createAccessToken(authCode), this.createRefreshToken(authCode)]);
    }

    async createAccessToken({ userId, clientId }) {
        const token = await this.uid(process.env.TOKEN_LENGTH || 60);
        const expiration = calculateExpirationDate(process.env.DEFAULT_TOKEN_EXPIRATION || 86400);
        return accessTokenModel.create({ token, expiry_date: expiration, user_id: userId, client_id:clientId, scope: 0})
            .then(results => this.promise.resolve({ token: results.token, expiry_date: results.expiry_date}))
            .catch(err => {
                console.log("err", err);
                this.promise.reject({ code: 500, message: "Cannot Save Access Token", error: err });
            });
    }

    async createRefreshToken({ userId, clientId }) {
        const token = await this.uid(process.env.TOKEN_LENGTH || 60);
        const expiration = calculateExpirationDate(process.env.DEFAULT_REFRESH_TOKEN_EXPIRATION || 86400);
        return refreshTokenModel.create({ token, user_id: userId, expiry_date: expiration, client_id:clientId })
            .then(results => this.promise.resolve(results.token))
            .catch(err => this.promise.reject({ code: 500, message: "Cannot Save Refresh Token", error: err }));
    }

    async getVerifiedClient(clientData) {
        return {
            client_id: clientData.client_id,
            permissions: clientData.permissions,
            title: clientData.title
        };
    }

    removeAccessTokenByClientUser(userId, clientId) {
    // Get access token before destroy
        return accessTokenModel.findOne({where: {client_id : clientId, user_id: userId}})
            .then(results => {
                if (results) {
                    results.destroy();
                }
                this.promise.resolve(true);
            })
            .catch(err => {
                console.log("err", err);
                this.promise.resolve(false);
            });
    }

    getRefreshToken(token) {
        if (!token) {
            throw Boom.badRequest("Missing token");
        }
        return refreshTokenModel.findOne({where: {token: token}})
            .then(results => this.promise.resolve(results))
            .catch(err => this.promise.reject({ code: 404, message: "Cannot Find Refresh Token", error: err }));
    }

    removeRefreshTokenByClientUser(userId, clientId) {
        return refreshTokenModel.findOne({where: {client_id : clientId, user_id: userId}})
            .then(results => {
                if (results) {
                    results.destroy();
                }
                this.promise.resolve(true);
            })
            .catch(err => {
                console.log("err", err);
                this.promise.resolve(false);
            });
    }

    getClientByClientID(clientId) {
        if (!clientId) {
            throw Boom.badRequest("Missing client id");
        }
        return clientModel.findOne({where: {client_id: clientId}})
            .then(results => this.promise.resolve(results))
            .catch(err => this.promise.reject({ code: 404, message: "Cannot Find Client", error: err }));
    }

    getAccessToken(token) {
        if (!token) {
            throw Boom.badRequest("Missing token");
        }
        return accessTokenModel.findOne({where: {token}})
            .then(results => this.promise.resolve(results))
            .catch(err => this.promise.reject({ code: 404, message: "Not authorized", error: err }));
    }

    validateAccessToken(tokenData) {
        if (!tokenData || !tokenData.expiry_date) {
            throw Boom.badRequest("Token Expired");
        }
        if (Date.now() >= tokenData.expiry_date * 1000) {
            throw Boom.badRequest("Token Expired");
        }
        return {
            token: tokenData.token,
            user_id: tokenData.user_id,
            client_id: tokenData.client_id
        };
    }

    async uid(len) {
        const buf = [];
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charlen = chars.length;
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < len; i++) {
            buf.push(chars[this.getRandomInt(0, charlen - 1)]);
        }
        return buf.join("");
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

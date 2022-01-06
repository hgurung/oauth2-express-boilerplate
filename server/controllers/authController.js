const Boom = require("@hapi/boom");
const bcrypt = require("bcryptjs");
const oauth2orize = require("oauth2orize");

const AuthService = require("../services/authService");
const Controller = require("../model/controllerModel");
const UserService = require("../services/userService");

const {
    ERROR_INCORRECT_VALUE,
    ERROR_USERNAME_PASSWORD_NOT_MATCHED
} = require("../common/constant");

const { checkServerAccess, validate, wrapAsync } = require("../middlewares");
const rateLimit = require("express-rate-limit");

const {
    changePasswordLoginValidation
} = require("../validators/user");

module.exports = class AuthController extends Controller {
    constructor(passport) {
        super();
        this.passport = passport;
        this.server = oauth2orize.createServer();

        this.passwordExchange();
        this.refreshTokenExchange();
        this.router.get("/auth/test", this.testApi.bind(this));
        const basicAuth = this.passport.authenticate(["basic"], { session: false});
        const throttleRequestNumber = process.env.THROTTLE_REQUEST ?? 5;
        const throttleRequestTime = process.env.THROTTLE_TIME ?? 5;
        // Throtlling config
        const createAccountLimiter = rateLimit({
            windowMs: throttleRequestTime * 60 * 1000, // 1 hour window
            max: parseInt(throttleRequestNumber), // start blocking after 5 requests,
            statusCode: 423,
            message: `Too many attempts! Please try again after ${throttleRequestTime} minute.`,
            onLimitReached(req) {
                console.log('req.header', req.headers);
            }
        });
        this.router.post("/auth/token", createAccountLimiter, basicAuth, checkServerAccess([1, 2]), this.server.token());
        this.router.get("/auth/logout", this.passport.authenticate(["bearer"], { session: false }), this.logOut.bind(this));
        // Get Profile 
        this.router.get("/auth/me", this.passport.authenticate(["bearer"], { session: false }), this.getProfile.bind(this));
        // Change password
        this.router.post("/auth/change-password", this.passport.authenticate(["bearer"], { session: false }), changePasswordLoginValidation, validate, wrapAsync(this.changePassword.bind(this)));
    }

    logOut(req, res) {
        const authService = new AuthService();
        return authService.logOut(req.authInfo).then(() => res.status(200).send({ message: "success" }));
    }

    getProfile(req, res) {
        const userService = new UserService();
        return userService.getProfile(req.authInfo).then((success) => res.status(200).send(success));
    }

    // Change password api
    changePassword(req, res) {
        const userService = new UserService();
        return userService.changePassword(req.authInfo, req.body).then((success) => res.status(200).send(success));
    }

    passwordExchange() {
        const userService = new UserService();
        const authService = new AuthService();

        // Exchange username & password for an access token.
        this.server.exchange(
            oauth2orize.exchange.password((client, username, password, scope, done) => {
                    let userData = {};
                    userService
                        .getUserByUserName(username)
                        .then(user => {
                            console.log('user', user);
                            userData = user;
                            if (!user) {
                                throw new Boom.Boom("Username / password is invalid.", {
                                    statusCode: 401,
                                    data: {
                                        errorCode: ERROR_USERNAME_PASSWORD_NOT_MATCHED
                                    }
                                });
                            }
                            return bcrypt.compare(password, user.password);
                        })
                        .then(matched => {
                            if (!matched) {
                                throw new Boom.Boom("Username/Password is not valid.", {
                                    statusCode: 401,
                                    data: {
                                        errorCode: ERROR_USERNAME_PASSWORD_NOT_MATCHED
                                    }
                                });
                            }

                            const refreshTokenRemove = authService.removeAccessTokenByClientUser(
                                userData.id,
                                client.client_id
                            );
                            const accessTokenRemove = authService.removeRefreshTokenByClientUser(
                                userData.id,
                                client.client_id
                            );
                            return Promise.all([refreshTokenRemove, accessTokenRemove]);
                        })
                        .then(() =>
                            authService.generateTokens({
                                userId: userData.id,
                                clientId: client.client_id,
                                scope
                            })
                        )
                        .then(tokens => {
                            // Update last login date
                            if (tokens === false) {return done(null, false);}
                            if (tokens.length === 2) {return done(null, tokens[0].token, tokens[1], { "expires_in": tokens[0].expiry_date });}
                            throw Boom.internal("Error exchanging password for tokens");
                        })
                        .catch(err => done(err, false));
            })
        );
    }

    refreshTokenExchange() {
        const authService = new AuthService();
        // Exchange refreshToken for an access token.
        this.server.exchange(
            oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
                let _userId = 0;
                authService
                    .getRefreshToken(refreshToken)
                    .then(foundToken => {
                        console.log("foundToken", foundToken);
                        if (!foundToken || foundToken.client_id !== client.client_id)
                        {throw new Boom.Boom("Invalid token.", {
                            statusCode: 401,
                            data: { errorCode: ERROR_INCORRECT_VALUE }
                        });}

                        return foundToken;
                    })
                    .then(token => {
                        _userId = token.user_id;
                        const refreshTokenRemove = authService.removeAccessTokenByClientUser(
                            token.user_id,
                            client.client_id
                        );
                        const accessTokenRemove = authService.removeRefreshTokenByClientUser(
                            token.user_id,
                            client.client_id
                        );
                        return Promise.all([refreshTokenRemove, accessTokenRemove]);
                    })
                    .then(() =>
                        authService.generateTokens({
                            userId: _userId,
                            clientId: client.client_id,
                            scope
                        })
                    )
                    .then(tokens => {
                        if (tokens === false) {return done(null, false);}
                        if (tokens.length === 2) {return done(null, tokens[0].token, tokens[1], { "expires_in": tokens[0].expiry_date });}
                        throw Boom.internal("Error exchanging password for tokens");
                    })
                    .catch(err => done(err, false));
            })
        );
    }
};

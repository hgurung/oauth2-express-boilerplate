const { BasicStrategy } = require('passport-http');
const BearerStrategy = require('passport-http-bearer');

const AuthService = require('./services/authService');

module.exports = passport => {
    passport.use(
        new BasicStrategy((clientID, clientSecret, done) => {
            new AuthService()
                .getClientByClientID(clientID)
                .then(client => {
                    if (!client || client.client_secret !== clientSecret) {
                        return done(null, false);
                    }
                    return done(null, client);
                })
                .catch(err => {
                    console.log('clients Error', err);
                    return done(err, null);
                });
        })
    );

    // Uses Redis cache to fetch accessToken
    // In case of cache miss, the user needs to login again
    passport.use(
        new BearerStrategy((accessToken, done) => {
            new AuthService()
                .getAccessToken(accessToken)
                .then(token => {
                    if (!token || token === 'null') {
                        return done({ code: 401, message: 'Not authorized' });
                    }

                    if (!token || !token.expiry_date) {
                        return done('Token Expired', false);
                    }
                    if (Date.now() >= token.expiry_date * 1000) {
                        return done('Token Expired', false);
                    }
                    return done(null, true, {
                        token: token.token,
                        user_id: token.user_id,
                        client_id: token.client_id
                    });
                })
                .catch(err => {
                    return done(err, null);
                });
        })
    );
};

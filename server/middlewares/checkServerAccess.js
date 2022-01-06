// Middle ware for checking valid client id and secret
const Boom = require("@hapi/boom");

function checkServerAccess(options) {
    return function (req, res, next) {
    // Implement the middleware function based on the options object
        if (!req || !req.user) {
            throw Boom.unauthorized("Invalid client credential.");
        }
        if (!options.includes(req.user.server_access)) {
            throw Boom.unauthorized("Invalid client credential.");
        }
        next();
    };
}
module.exports = checkServerAccess;


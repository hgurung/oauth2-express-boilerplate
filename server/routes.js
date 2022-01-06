const express = require('express');
const passport = require('passport');
const { swaggerSpec } = require('./utils');
const AuthController = require('./controllers/authController');
const UserController = require('./controllers/userController');
const ClientController = require('./controllers/clientController');

require('./passportStrategies')(passport);

const routes = express.Router();

routes.get('/', (req, res) => {
    res.send({ apiVersion: req.app.locals.version, name: req.app.locals.name });
});

/**
 * GET /api/swagger.json
 */
routes.get('/swagger.json', (req, res) => {
    res.json(swaggerSpec);
});

routes.use(new AuthController(passport).router);
routes.use('/user', new UserController(passport).router);
// For registering clients and updating permission
routes.use('/client', new ClientController(passport).router);

// Authentication for Bearer Tokens
routes.use(passport.authenticate('bearer', { session: false }));

module.exports = routes;

const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");
/**
 * Swagger definition.
 */
const swaggerDefinition = {
    info: {
        title: process.env.APP_NAME || "oauth2-express-boilerplate",
        version: process.env.APP_VERSION || "0.1.0",
        description: process.env.APP_DESCRIPTION || "oauth2-express-boilerplate auth endpoints"
    },
    basePath: "/"
};

/**
 * Options for the swagger docs.
 */
const swaggerOptions = {
    // import swaggerDefinitions
    swaggerDefinition,
    // path to the API docs
    apis: [
        path.join(__dirname, "/../routes.js"),
        path.join(__dirname, "/../docs/*.js"),
        path.join(__dirname, "/../docs/*.yml"),
        path.join(__dirname, "/../docs/*.yaml")
    ],
    security: {}
};

const swagger = swaggerJSDoc(swaggerOptions);
module.exports = swagger;

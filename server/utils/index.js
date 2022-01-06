const swaggerSpec = require("./swagger");
const buildError = require("./buildError");

const calculateExpirationDate = expiresIn => Date.now() + expiresIn * 1000;

const isRefreshToken = ({ scope }) =>  {
    scope && scope.offline_access && scope.offline_access === 0;
};

module.exports = { swaggerSpec, buildError, calculateExpirationDate, isRefreshToken };

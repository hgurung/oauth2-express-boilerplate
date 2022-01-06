/* eslint-disable no-unused-vars */
const HTTPStatus = require("http-status-codes");

const { buildError } = require("../utils");

/**
 * Error response middleware for 404 not found.
 *
 * @param {Object} req
 * @param {Object} res
 */

const notFound = (req, res) =>
    res.status(HTTPStatus.NOT_FOUND).json({
        error: {
            code: HTTPStatus.NOT_FOUND,
            message: HTTPStatus.getStatusText(HTTPStatus.NOT_FOUND)
        }
    });

/**
 * Method not allowed error middleware. This middleware should be placed at
 * the very bottom of the middleware stack.
 *
 * @param {Object} req
 * @param {Object} res
 */

const methodNotAllowed = (req, res) =>
    res.status(HTTPStatus.METHOD_NOT_ALLOWED).json({
        error: {
            code: HTTPStatus.METHOD_NOT_ALLOWED,
            message: HTTPStatus.getStatusText(HTTPStatus.METHOD_NOT_ALLOWED)
        }
    });

/**
 * To handle errors from body parser for cases such as invalid JSON sent through
 * the body (https://github.com/expressjs/body-parser#errors).
 *
 * @param  {Object}   err
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */

const bodyParser = (err, req, res, next) =>
    res.status(err.status).json({
        error: {
            code: err.status,
            message: HTTPStatus.getStatusText(err.status)
        }
    });

/**
 * Generic error response middleware for Validation and Internal Server Error
 *
 * @param {Object} err
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */

const genericErrorHandler = (err, req, res, next) => {
    const error = buildError(err, res);
    res.status(error.code).json({ error });
};

module.exports = { notFound, methodNotAllowed, bodyParser, genericErrorHandler };

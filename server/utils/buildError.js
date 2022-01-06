const http = require("http");
const HTTPStatus = require("http-status-codes");
const { ERROR_TOKEN_NOT_VALID } = require("../common/constant");

module.exports = (err, res) => {
    // Validation errors
    if (err.isJoi) {
        return {
            code: HTTPStatus.BAD_REQUEST,
            message: HTTPStatus.getStatusText(HTTPStatus.BAD_REQUEST),
            details:
        err.details &&
        err.details.map(e => ({
            message: e.message,
            param: e.path.join(".")
        }))
        };
    }

    if (err.isBoom && err.output.statusCode === 429) {
        const rateLimiterRes = err.data;
        res.set({
            "Retry-After": rateLimiterRes.msBeforeNext / 1000,
            "X-RateLimit-Remaining": rateLimiterRes.remainingPoints,
            "X-RateLimit-Reset": new Date(Date.now() + rateLimiterRes.msBeforeNext)
        });
    }

    // HTTP errors
    if (err.isBoom) {
        return {
            code: err.output.statusCode,
            message: err.output.payload.message || err.output.payload.error,
            ...err.data
        };
    }

    if (err.name === "TokenError") {
        return {
            code: err.status,
            message: err.message,
            errorCode: ERROR_TOKEN_NOT_VALID
        };
    }

    if (err.code && err.code in http.STATUS_CODES) {
        return err;
    }

    console.error(err); // send unique error from db errors

    // Return INTERNAL_SERVER_ERROR for all other cases
    return {
        code: HTTPStatus.INTERNAL_SERVER_ERROR,
        message: HTTPStatus.getStatusText(HTTPStatus.INTERNAL_SERVER_ERROR)
    };
};

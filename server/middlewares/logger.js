const onHeaders = require("on-headers");

module.exports = () => (req, res, next) => {
    req.startAt = process.hrtime();

    const logReq = () => {
        const diff = process.hrtime(req.startAt);
        const resTime = diff[0] * 1e3 + diff[1] * 1e-6;
        const reqID = req.authInfo && req.authInfo.userId;
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress;
        console.log(
            `${new Date().toISOString()} ${ip} ${reqID || ""} ${req.method} ${req.originalUrl} ${
                res.statusCode
            } ${resTime.toFixed(2)}ms`
        );
    };
    onHeaders(res, logReq);
    next();
};

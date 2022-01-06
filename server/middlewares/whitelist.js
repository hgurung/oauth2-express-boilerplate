const ipLib = require("ip");
const { unauthorized } = require("@hapi/boom");

const whiteList = whitelisted => (req, res, next) => {
    const remoteAddress =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress;

    const list = whitelisted instanceof Array ? whitelisted : [whitelisted];
    if (
        list.some(ip => {
            const regularIP = (ipLib.isV4Format(ip) || ipLib.isV6Format(ip)) && ipLib.isEqual(ip, remoteAddress);
            const cidrIP = ip.includes("/") && ipLib.cidrSubnet(ip).contains(remoteAddress);

            return regularIP || cidrIP;
        })
    ) {
        return next();
    }

    return next(unauthorized(`${remoteAddress} is not a valid IP`));
};

module.exports = { whiteList };

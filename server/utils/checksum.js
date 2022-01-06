const util = require("util");
const crypto = require("crypto");
const crypt = require("./crypt");

function paramsToString(params) {
    let data = "";
    const tempKeys = Object.keys(params);
    tempKeys.sort();
    tempKeys.forEach(key => {
        if (key !== "CHECKSUMHASH") {
            data += `${params[key]}|`;
        }
    });
    return data;
}

async function genCheckSum(params, key) {
    const data = paramsToString(params);

    const salt = await crypt.gen_salt(4);
    const sha256 = crypto
        .createHash("sha256")
        .update(data + salt)
        .digest("hex");
    const checksum = sha256 + salt;
    const encrypted = crypt.encrypt(checksum, key);
    return encrypted;
}

function verifyCheckSum(params, key, checksumhash) {
    const data = paramsToString(params, false);
    const _checksumhash = checksumhash.replace("\n", "").replace("\r", "");

    if (typeof checksumhash !== "undefined") {
        const temp = decodeURIComponent(_checksumhash);
        const checksum = crypt.decrypt(temp, key);
        const salt = checksum.substr(checksum.length - 4);
        const sha256 = checksum.substr(0, checksum.length - 4);
        const hash = crypto
            .createHash("sha256")
            .update(data + salt)
            .digest("hex");
        if (hash === sha256) {
            return true;
        }
        util.log("checksum is wrong");
        return false;
    }
    util.log("checksum not found");
    return false;
}

module.exports.genCheckSum = genCheckSum;
module.exports.verifyCheckSum = verifyCheckSum;

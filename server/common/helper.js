const fs = require("fs");
const axios = require("axios");
const crypto = require("crypto");
const path = require("path");
const moment = require("moment");

function generateRandomString(stringLength) {
    let randomString = "";
    let asciiLow = 65;
    let asciiHigh = 90;
    for (let i = 0; i < stringLength; i++) {
        let randomAscii = Math.floor((Math.random() * (asciiHigh - asciiLow)) + asciiLow);
        randomString += String.fromCharCode(randomAscii);
    }
    return randomString + crypto.randomBytes(stringLength).toString("hex");
}

function validateEmail(email) {
    let emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, "");
}

function compare(arr1, arr2) {
    if (!arr1 || !arr2) {return;}
    let result;
    arr1.forEach((e1, i) => arr2.forEach(e2 => {
        console.log(i);
        if (e1.length > 1 && e2.length) {
            result = compare(e1, e2);
        } else if (e1 !== e2) {
            result = false;
        } else {
            result = true;
        }
    })
    );
    return result;
}

function generateToken(length) {
    let buf = [],
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        charlen = chars.length;

    for (let i = 0; i < length; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }
    return buf.join("");
}

function removeFile(path) {
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
}

function getClientIpAddress(req) {
    let ipAddress;
    // The request may be forwarded from local web server.
    const forwardedIpsStr = req.header("x-forwarded-for");
    if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
        const forwardedIps = forwardedIpsStr.split(",");
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
    // If request was not forwarded
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
}

async function mapIpToLocation(ip) {
    let location = null;
    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        if (response.data.status === "success") {
            location = {
                country: response.data.country,
                city: response.data.city
            };
        }
    } catch (e) {
        console.log(e);
    }
    return location;
}

async function validateServerPhoneNumber(phoneNumber) {
    try {
        let datas = {};

        let url = process.env.PHONEVALIDATEURL;
        let username = process.env.PHONEVALIDATEIUSERNAME;
        let pass = process.env.PHONEVALIDATEPASSWORD;
        await axios.post(url, {"mobile_no": phoneNumber}, {
            auth: {
                username: username,
                password: pass
            }
        }).then(function (response) {
            let status = response.data[0] ? response.data[0].status ? response.data[0].status : false : false;
            let lpcardNumbers = response.data[0] ? response.data[0].lpcardno ? response.data[0].lpcardno : [] : [];
            let fullName = response.data[0] ? response.data[0].name ? response.data[0].name : "" : "";
            datas["status"] = status;
            datas["lpcardno"] = lpcardNumbers;
            datas["name"] = fullName;

        }).catch(function (error) {
            console.log("Error on Authentication", error, 2);
            datas["status"] = false;
            datas["lpcardno"] = [];
            datas["name"] = "";
        });
        return datas;

    } catch (e) {
        console.log(e);
        return false;
    }

}

function mkDirByPathSync(targetDir, {isRelativeToScript = false} = {}) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : "";
    const baseDir = isRelativeToScript ? __dirname : ".";

    return targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir);
        try {
            fs.mkdirSync(curDir);
        } catch (err) {
            if (err.code === "EEXIST") { // curDir already exists!
                return curDir;
            }

            // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
            if (err.code === "ENOENT") { // Throw the original parentDir error on curDir `ENOENT` failure.
                throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
            }

            const caughtErr = ["EACCES", "EPERM", "EISDIR"].indexOf(err.code) > -1;
            if (!caughtErr || caughtErr && targetDir === curDir) {
                throw err; // Throw if it's just the last created dir.
            }
        }

        return curDir;
    }, initDir);
}

function arrayFlattern(array) {
    return Array.prototype.concat.apply([], array);
}

function randomValueBase64(len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString("base64")   // convert to base64 format
        .slice(0, len)        // return required number of characters
        .replace(/\+/g, "0")  // replace '+' with '0'
        .replace(/\//g, "0"); // replace '/' with '0'
}

let getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function generateRandomCode(n) {
    let add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

    if (n > max) {
        return generateRandomCode(max) + generateRandomCode(n - max);
    }

    max = Math.pow(10, n + add);
    let min = max / 10; // Math.pow(10, n) basically
    let number = Math.floor(Math.random() * (max - min + 1)) + min;

    return ("" + number).substring(add);

}

async function capitalizeName(name) {
    return name.replace(/\b(\w)/g, s => s.toUpperCase());
}

let formatDate = (date, format) => {
    let dateFormat = format || "YYYY-MM-DD HH:mm:ss";
    return moment(date).format(dateFormat);
};

function removeJsonInarrayByValue(array, key, value) {
    return array.filter(function (a) {
        return a[key] !== value;
    });
}

function convertIptoNumber(ip) {
    return ip.split(".").map(d => ("000" + d).substr(-3)).join("");
}

function decryptbase64Data(encryptedText) {
    //get iv first 16 bytes
    const iv = Buffer.from(encryptedText, "base64").slice(0, 16);
    let message = Buffer.from(encryptedText, "base64").slice(16);
    const decipher = crypto.createDecipheriv(process.env.DECRYPT_ALGORITHM, process.env.DECRYPT_KEY, iv);
    decipher.setAutoPadding(true);
    let decrypted = decipher.update(message);
    decrypted += decipher.final("utf-8");
    return decrypted;
}

function convertSecondToTimerFormat(duration) {
    let minutes = parseInt(duration / 60);
    let seconds = parseInt(duration % 60);
    let hours = parseInt(minutes / 60);
    minutes = parseInt(minutes % 60);
    return hours + " hrs " + minutes + " mins " + seconds + " secs";
}

let addLogToFile = (fileName, logData) => {
    let log = typeof logData === "string" ? logData : JSON.stringify(logData);
    try {
        if (fs.existsSync(fileName)) {
            fs.appendFileSync(fileName, "\n" + log);
        } else {
            fs.appendFileSync(fileName, log);
        }
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    convertSecondToTimerFormat,
    removeJsonInarrayByValue,
    camelize,
    decryptbase64Data,
    removeFile,
    mapIpToLocation,
    randomValueBase64,
    generateToken,
    compare,
    generateRandomString,
    getClientIpAddress,
    mkDirByPathSync,
    validateEmail,
    validateServerPhoneNumber,
    generateRandomCode,
    formatDate,
    capitalizeName,
    arrayFlattern,
    convertIptoNumber,
    addLogToFile
};
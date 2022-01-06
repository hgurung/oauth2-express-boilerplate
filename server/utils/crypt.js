"use strict";

const crypto = require("crypto");
const util = require("util");

const crypt = {
    iv: "@@@@&&&&####$$$$",

    encrypt(data, customKey) {
        const { iv } = this;
        const key = customKey;
        let algo = "256";
        switch (key.length) {
        case 16:
            algo = "128";
            break;
        case 24:
            algo = "192";
            break;
        default:
            algo = "256";
            break;
        }
        const cipher = crypto.createCipheriv(`AES-${algo}-CBC`, key, iv);
        let encrypted = cipher.update(data, "binary", "base64");
        encrypted += cipher.final("base64");
        return encrypted;
    },

    decrypt(data, customKey) {
        const { iv } = this;
        const key = customKey;
        let algo = "256";
        switch (key.length) {
        case 16:
            algo = "128";
            break;
        case 24:
            algo = "192";
            break;
        default:
            algo = "256";
            break;
        }
        const decipher = crypto.createDecipheriv(`AES-${algo}-CBC`, key, iv);
        let decrypted = decipher.update(data, "base64", "binary");
        try {
            decrypted += decipher.final("binary");
        } catch (e) {
            util.log(util.inspect(e));
        }
        return decrypted;
    },

    async gen_salt(length) {
        return new Promise((resolve, reject) => {
            crypto.randomBytes((length * 3.0) / 4.0, (err, buf) => {
                if (err) {
                    reject(err);
                }
                resolve(buf.toString("base64"));
            });
        });
    }
};

module.exports = crypt;

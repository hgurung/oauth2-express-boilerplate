const Promise = require("promise");

const levels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
};

module.exports = class Service {
    constructor() {
        this.logLevel = levels.DEBUG;
    }

    get promise() {
        return Promise;
    }

    log() {
        const level = this.logLevel;

        function debug(msg) {
            if (levels.DEBUG < level) {
                return;
            }
            console.debug(JSON.stringify(msg));
        }

        function info(who, msg, data) {
            if (levels.INFO < level) {
                return;
            }
            console.info(who, JSON.stringify(msg), JSON.stringify(data));
        }

        function error(who, err = {}, msg, data) {
            if (levels.ERROR < level) {
                return;
            }
            console.error(who, JSON.stringify(err), JSON.stringify(msg), JSON.stringify(data));
        }

        return Object.freeze({
            debug,
            info,
            error
        });
    }

    flatten(array) {
        return array.reduce((a, b) => {
            if (!b) {
                return a;
            }
            return a.concat(b);
        }, []);
    }

    contains(array, ...values) {
        return values.some(value => array.includes(value));
    }

    pluck(array, property) {
        return array.map(item => item[property]);
    }

    async addTimeout(t = 500) {
        await new Promise(resolve => {
            setTimeout(resolve, t);
        });
    }
};

const express = require("express");
const Promise = require("promise");

module.exports = class Controller {
    constructor() {
        this.privateRouter = express.Router();
    }

    get router() {
        return this.privateRouter;
    }

    get promise() {
        return Promise;
    }
};

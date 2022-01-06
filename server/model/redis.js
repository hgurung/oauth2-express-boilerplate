const redis = require("redis");
const { promisify } = require("util");

let client;

// this creates a new client
const createClient = (port, host, password, db) => {
    client = redis.createClient(port, host, { password, db });

    client.delAsync = promisify(client.del).bind(client);
    client.setAsync = promisify(client.set).bind(client);
    client.getAsync = promisify(client.get).bind(client);
    client.addAsync = promisify(client.zadd).bind(client);
    client.scanAsync = promisify(client.zscan).bind(client);
    client.setexAsync = promisify(client.setex).bind(client);
    client.getAllAsync = promisify(client.mget).bind(client);
    client.countAsync = promisify(client.zcount).bind(client);
    client.rangeAsync = promisify(client.zrange).bind(client);
    client.rangeByScoreAsync = promisify(client.zrangebyscore).bind(client);
    return client;
};

const getClient = () => client;

module.exports = {
    getClient,
    createClient
};

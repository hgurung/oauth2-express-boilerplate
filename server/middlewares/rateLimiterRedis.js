const redis = require("redis");
const {RateLimiterRedis} = require("rate-limiter-flexible");

let rateLimiterMiddleware;

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || "6379",
    enable_offline_queue: false
});

// Check if redis is running
let redisIsReady = false;
redisClient.on("error", function() {
    redisIsReady = false;
});
redisClient.on("ready", function() {
    redisIsReady = true;
});

if (redisIsReady) {
    try {
        const rateLimiter = new RateLimiterRedis({
            storeClient: redisClient,
            keyPrefix: "middleware",
            points: process.env.RATE_LIMIT_POINTS || 10, // 10 requests
            duration: process.env.RATE_LIMIT_DURATION || 10 // per 10 second by IP
        });
    
        rateLimiterMiddleware = (req, res, next) => {
            rateLimiter.consume(req.ip)
                .then(() => {
                    next();
                })
                .catch(() => {
                    res.status(429).send("Too Many Requests");
                });
        };  
    } catch (err) {
        rateLimiterMiddleware = (req, res, next) => {
            next();
        };
    } 
} else {
    rateLimiterMiddleware = (req, res, next) => {
        next();
    };
}


module.exports = rateLimiterMiddleware;

const fs = require('fs');
const http = require('http');
const helmet = require('helmet');
const express = require('express');
const passport = require('passport');
const compression = require('compression');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath();

const apiRoutes = require('./routes');
// const RateLimiter = require('./model/rateLimiter');
const { logger, cors, errorHandler, rateLimiterMiddleware } = require('./middlewares');

require('dotenv').config();

// Setup DB Connection and running default seeds
require('./database/database');
require('./database/seeds/Index');
// setup DB Connection

const app = express();
require('./passportStrategies')(passport);

// Trust proxy
app.set('trust proxy', 1);

// Add Rate limiter globally in middlewares
app.use(rateLimiterMiddleware);

app.use(cors());
app.use(logger());
app.use(helmet());
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler.bodyParser);
app.use(passport.initialize());

// Serve publicly available static files
app.use('/public/', express.static('public'));

app.locals.name = process.env.APP_NAME || 'oauth2-express-boilerplate';
app.locals.version = process.env.APP_VERSION || '0.1.0';

// Swagger UI
// Workaround for changing the default URL in swagger.json
// https://github.com/swagger-api/swagger-ui/issues/4624
const swaggerIndexContent = fs
    .readFileSync(`${pathToSwaggerUi}/index.html`)
    .toString()
    .replace('https://petstore.swagger.io/v2/swagger.json', '/swagger.json');

app.get('/api-docs/index.html', (req, res) => res.send(swaggerIndexContent));
app.get('/api-docs', (req, res) => res.redirect('/api-docs/index.html'));
app.use('/api-docs', express.static(pathToSwaggerUi));

app.use('/', apiRoutes);

// Error Middlewares
app.use(errorHandler.genericErrorHandler);
app.use(errorHandler.notFound);

const port = process.env.APP_PORT || 8080;
const server = http.createServer(app);

server.listen(port);
console.log(`Server started on port: ${port}`);

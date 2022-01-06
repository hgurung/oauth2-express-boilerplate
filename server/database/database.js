const Sequelize = require("sequelize");
require('dotenv').config();
const postgres = new Sequelize(process.env.DBCONFIG || "postgres://username::root@127.0.0.1:5432/oauth2-express-boilerplate",{
    logging: false,
    dialect: "postgres",
    define: {
        underscored: true
    }
});
postgres.authenticate().then(() => {
    console.log("Database connection has been established successfully.");
}).catch(err => {
    console.error("Unable to connect to the database:", err);
});

module.exports = {postgres};
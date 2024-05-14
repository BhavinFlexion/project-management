const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("db_PMS_System", "root", "", {
  host: "localhost",
  port: 3307,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialect: "mysql",
});

try {
  sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.DataTypes = DataTypes;

module.exports = db;

const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

sequelize
  .authenticate()
  .then(() => console.log("✅ Connected to PostgreSQL successfully!"))
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = sequelize;
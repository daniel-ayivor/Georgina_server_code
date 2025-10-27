// const { Sequelize } = require("sequelize");
// require("dotenv").config();

// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: "postgres",
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false,
//     },
//   },
//   logging: false,
// });

// sequelize
//   .authenticate()
//   .then(() => console.log("✅ Connected to PostgreSQL successfully!"))
//   .catch((err) => console.error("❌ Database connection error:", err));

// module.exports = sequelize;

const { Sequelize } = require("sequelize");
require("dotenv").config();

// For local development - remove SSL options
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  // Remove dialectOptions for local development
});

// Alternative configuration using individual parameters
// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: 'postgres',
//     logging: false
//   }
// );

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Connected to LOCAL PostgreSQL successfully!");
    console.log(`📊 Database: ${process.env.DB_NAME}`);
  })
  .catch((err) => {
    console.error("❌ Local database connection error:");
    console.error("Error details:", err);
  });

module.exports = sequelize;
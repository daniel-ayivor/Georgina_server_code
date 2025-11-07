

// const { Sequelize } = require("sequelize");
// require("dotenv").config();

// // For local development - remove SSL options
// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: "postgres",
//   logging: false,
//   // Remove dialectOptions for local development
// });

// console.log("🌐 Connecting to LOCAL PostgreSQL Database...", process.env.DATABASE_URL);

// sequelize
//   .authenticate()
//   .then(() => {
//     console.log("✅ Connected to LOCAL PostgreSQL successfully!");
//     console.log(`📊 Database: ${process.env.DB_NAME}`);
//   })
//   .catch((err) => {
//     console.error("❌ Local database connection error:");
//     console.error("Error details:", err);
//   });

// module.exports = sequelize;


const { Sequelize } = require("sequelize");
require("dotenv").config();

// For Render PostgreSQL - SSL is REQUIRED
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,          // ✅ REQUIRED for Render
      rejectUnauthorized: false  // ✅ REQUIRED for Render
    }
  },
  logging: console.log, // Set to false if you don't want SQL logs
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

console.log("🌐 Connecting to RENDER PostgreSQL Database...");

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Connected to RENDER PostgreSQL successfully!");
    console.log(`📊 Database: georgina_db_r90t`);
    console.log(`🌍 Host: dpg-d471h7qdbo4c739jnpvg-a.oregon-postgres.render.com`);
  })
  .catch((err) => {
    console.error("❌ Render database connection failed:");
    console.error("Error details:", err.message);
    
    // Specific error handling for common issues
    if (err.message.includes('SSL')) {
      console.error("🔒 SSL ERROR: Render requires SSL connections. Make sure dialectOptions.ssl is configured.");
    }
    if (err.message.includes('authentication')) {
      console.error("🔑 AUTH ERROR: Check your database password in DATABASE_URL");
    }
    if (err.message.includes('getaddrinfo')) {
      console.error("🌐 NETWORK ERROR: Cannot reach Render database host. Check your internet connection.");
    }
  });

module.exports = sequelize;
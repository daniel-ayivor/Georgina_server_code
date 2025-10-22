const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;

// Check if DATABASE_URL exists (for production environments like Render)
if (process.env.DATABASE_URL) {
  console.log("📡 Using DATABASE_URL for connection...");
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Supabase SSL
      }
    },
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Use individual variables for local development
  console.log("🔧 Using individual DB environment variables...");
  
  sequelize = new Sequelize(
    process.env.DB_NAME || "postgres",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Connected to Supabase PostgreSQL successfully!");
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
    console.error("💡 Check your DATABASE_URL or individual DB credentials");
  });

module.exports = sequelize;
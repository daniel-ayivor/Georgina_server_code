const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL for production (Render, Heroku, etc.)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // For managed DBs like Render, Heroku, etc.
      }
    },
    logging: false
  });
} else {
  // Use individual variables for local development
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Needed for Supabase SSL
        },
      },
      logging: false, // Optional: turn off SQL query logs
    }
  );
}

sequelize
  .authenticate()
  .then(() => console.log("✅ Connected to Supabase PostgreSQL successfully!"))
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = sequelize;

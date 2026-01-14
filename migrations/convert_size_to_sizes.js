// Migration: Convert 'size' string column to 'sizes' JSON array in products table
// Usage: Run with `node migrations/convert_size_to_sizes.js`

const { Sequelize } = require('sequelize');
const sequelize = require('../Database/database');

async function migrate() {
  try {
    // 1. Add the new 'sizes' column if it doesn't exist (should already exist if model updated)
    // 2. Copy data from 'size' to 'sizes' as a JSON array
    // 3. Remove the old 'size' column

    // Step 1: Check if 'size' column exists
    const [results] = await sequelize.query(`PRAGMA table_info(products);`);
    const hasSize = results.some(col => col.name === 'size');

    if (!hasSize) {
      console.log("No 'size' column found. Migration not needed.");
      return;
    }

    // Step 2: Update 'sizes' for all products by parsing the JSON string in 'size'
    // This works for MySQL and Postgres. For SQLite, use json() function if available.
    await sequelize.query(`
      UPDATE products
      SET sizes = CAST(size AS JSON)
      WHERE size IS NOT NULL AND size != '';
    `);
    console.log("Copied 'size' JSON string values to 'sizes' as JSON array.");

    // Step 3: Drop the old 'size' column
    // SQLite does not support DROP COLUMN directly, so you may need to recreate the table if using SQLite.
    // For MySQL/Postgres, you can use:
    await sequelize.query(`ALTER TABLE products DROP COLUMN size;`);
    console.log("Dropped 'size' column.");

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();

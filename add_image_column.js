const sequelize = require('./Database/database');

async function addImageColumn() {
  try {
    console.log('Adding image column to order_items table...');
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'order_items' 
      AND COLUMN_NAME = 'image'
    `);
    
    if (results.length > 0) {
      console.log('✅ Image column already exists in order_items table');
      process.exit(0);
    }
    
    // Add the column
    await sequelize.query(`
      ALTER TABLE order_items 
      ADD COLUMN image TEXT NULL AFTER productName
    `);
    
    console.log('✅ Successfully added image column to order_items table');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error adding image column:', error.message);
    process.exit(1);
  }
}

addImageColumn();

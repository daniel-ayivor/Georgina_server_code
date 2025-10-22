const sequelize = require('./Database/database');
const User = require('./Models/userModel');
const Category = require('./Models/categoryModel');
const SubCategory = require('./Models/subCategoryModel');
const Product = require('./Models/productModel');
const Order = require('./Models/orderModel');

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database schema...');
    
    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database schema synced successfully!');
    
    // Check if admin user exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@georgina.com' } });
    if (!existingAdmin) {
      console.log('👤 Creating admin user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@georgina.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@georgina.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Role: admin');
    } else {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email: admin@georgina.com');
      console.log('🔑 Password: admin123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    process.exit(1);
  }
}

syncDatabase();

const bcrypt = require('bcryptjs');
const User = require('./Models/userModel');
const sequelize = require('./Database/database');

async function createAdmin() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@georgina.com' } });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists!');
      console.log('📧 Email: admin@georgina.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Role: admin');
      process.exit(0);
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    console.log('👤 Creating admin user...');
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
    console.log('🆔 User ID:', adminUser.id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.name === 'SequelizeConnectionError') {
      console.log('💡 Database connection failed. Make sure your database is running and accessible.');
    }
    process.exit(1);
  }
}

createAdmin();

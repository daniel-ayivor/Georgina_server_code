const bcrypt = require('bcryptjs');
const User = require('./Models/userModel');
const sequelize = require('./Database/database');

async function createAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@georgina.com' } });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@georgina.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@georgina.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@georgina.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('User ID:', adminUser.id);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();

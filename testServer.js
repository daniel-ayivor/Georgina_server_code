const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Create admin user endpoint
app.post('/create-admin', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const User = require('./Models/userModel');
    const sequelize = require('./Database/database');

    await sequelize.authenticate();
    console.log('Database connected...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@georgina.com' } });
    if (existingAdmin) {
      return res.json({ 
        message: 'Admin user already exists!',
        credentials: {
          email: 'admin@georgina.com',
          password: 'admin123'
        }
      });
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

    res.json({
      message: 'Admin user created successfully!',
      credentials: {
        email: 'admin@georgina.com',
        password: 'admin123',
        role: 'admin',
        id: adminUser.id
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Test server is running at http://localhost:${PORT}`);
  console.log('Test endpoint: http://localhost:' + PORT + '/test');
  console.log('Create admin: POST http://localhost:' + PORT + '/create-admin');
});

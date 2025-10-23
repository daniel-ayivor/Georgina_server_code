const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// In-memory storage for demo purposes
const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@georgina.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    role: 'admin'
  }
];

const categories = [
  {
    id: '1',
    name: 'Clothes',
    description: 'This would be the main, top-level category for all apparel.',
    slug: 'clothes',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    subcategories: [
      { id: '1-1', name: 'Men', slug: 'men', parentId: '1' },
      { id: '1-2', name: 'Women', slug: 'women', parentId: '1' },
      { id: '1-3', name: 'Kids', slug: 'kids', parentId: '1' }
    ]
  },
  {
    id: '2',
    name: 'Foodstuffs',
    description: 'This broad category is for all edible products.',
    slug: 'foodstuffs',
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    subcategories: [
      { id: '2-1', name: 'Pantry', slug: 'pantry', parentId: '2' },
      { id: '2-2', name: 'Prepared Mixes', slug: 'prepared-mixes', parentId: '2' },
      { id: '2-3', name: 'Soup Base', slug: 'soup-base', parentId: '2' }
    ]
  },
  {
    id: '3',
    name: 'Services',
    description: 'This top-level category is for any non-tangible offerings.',
    slug: 'services',
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    subcategories: [
      { id: '3-1', name: 'Cleaning Services', slug: 'cleaning-services', parentId: '3' }
    ]
  }
];

// Auth middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Routes
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Auth routes - Customer
app.post('/api/auth/customer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Auth routes - Admin
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.role === 'admin');
    
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Legacy endpoints for backward compatibility
app.post('/api/auth/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Categories routes
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.post('/api/categories', authenticate, (req, res) => {
  const newCategory = {
    id: Date.now().toString(),
    ...req.body,
    subcategories: []
  };
  categories.push(newCategory);
  res.json(newCategory);
});

app.put('/api/categories/:id', authenticate, (req, res) => {
  const index = categories.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }
  categories[index] = { ...categories[index], ...req.body };
  res.json(categories[index]);
});

app.delete('/api/categories/:id', authenticate, (req, res) => {
  const index = categories.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }
  categories.splice(index, 1);
  res.status(204).end();
});

// Subcategories routes
app.get('/api/subcategories', (req, res) => {
  const allSubcategories = categories.flatMap(cat => cat.subcategories);
  res.json(allSubcategories);
});

app.post('/api/subcategories', authenticate, (req, res) => {
  const newSubcategory = {
    id: Date.now().toString(),
    ...req.body
  };
  
  const category = categories.find(c => c.id === req.body.parentId);
  if (category) {
    category.subcategories.push(newSubcategory);
  }
  
  res.json(newSubcategory);
});

// Products routes (mock data)
app.get('/api/products', (req, res) => {
  res.json([]);
});

app.get('/api/products/trending', (req, res) => {
  res.json({
    products: [],
    total: 0,
    page: 1,
    limit: 10,
    message: "Trending products retrieved successfully"
  });
});

app.get('/api/products/new-arrivals', (req, res) => {
  res.json({
    products: [],
    total: 0,
    page: 1,
    limit: 10,
    message: "New arrival products retrieved successfully"
  });
});

app.get('/api/products/featured', (req, res) => {
  res.json({
    products: [],
    total: 0,
    page: 1,
    limit: 10,
    message: "Featured products retrieved successfully"
  });
});

// Orders routes (mock data)
app.get('/api/orders', (req, res) => {
  res.json([]);
});

// Customers routes (mock data)
app.get('/api/customers', (req, res) => {
  res.json([]);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Fallback server is running at http://localhost:${PORT}`);
  console.log('📧 Admin Email: admin@georgina.com');
  console.log('🔑 Admin Password: admin123');
  console.log('👑 Role: admin');
  console.log('🔗 Test endpoint: http://localhost:' + PORT + '/test');
});

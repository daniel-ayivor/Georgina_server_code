const Customer = require('../Models/customerModel');
const User = require('../Models/userModel');
const Order = require('../Models/orderModel');
const Booking = require('../Models/booking');

// Helper to compute orders and total spent
async function computeCustomerStats(userId) {
  const ordersCount = await Order.count({ where: { userId } });
  const bookingsCount = await Booking.count({ where: { userId } });

  const totalOrderAmount = await Order.sum('totalAmount', { where: { userId } }) || 0;
  const totalBookingAmount = await Booking.sum('price', { where: { userId } }) || 0;

  return {
    orders: ordersCount + bookingsCount,
    totalSpent: totalOrderAmount + totalBookingAmount,
    isCustomer: ordersCount + bookingsCount > 0
  };
}

// ✅ CREATE customer
const createCustomer = async (req, res) => {
  try {
    const { userId, name, email, phone } = req.body;
    if (!userId || !name || !email) {
      return res.status(400).json({ error: 'userId, name, and email are required' });
    }

    const stats = await computeCustomerStats(userId);
    if (!stats.isCustomer) {
      return res.status(400).json({ error: 'User has no orders or bookings yet' });
    }

    const [customer, created] = await Customer.findOrCreate({
      where: { userId },
      defaults: {
        name,
        email,
        phone,
        orders: stats.orders,
        totalSpent: stats.totalSpent,
      },
    });

    res.status(created ? 201 : 200).json({ ...customer.toJSON(), ...stats });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ GET all customers (with User, Orders & Bookings)
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'contact', 'role'],
          include: [
            { model: Order, as: 'orders', attributes: ['id', 'totalAmount', 'status', 'createdAt'] },
            { model: Booking, as: 'bookings', attributes: ['id', 'price', 'status', 'createdAt'] }
          ]
        }
      ]
    });

    // Optionally compute totals
    const enriched = await Promise.all(customers.map(async (c) => {
      const stats = await computeCustomerStats(c.userId);
      return { ...c.toJSON(), ...stats };
    }));

    res.status(200).json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET single customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'contact'],
          include: [
            { model: Order, as: 'orders' },
            { model: Booking, as: 'bookings' }
          ]
        }
      ]
    });

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const stats = await computeCustomerStats(customer.userId);
    res.status(200).json({ ...customer.toJSON(), ...stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    await customer.update(req.body);
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ DELETE
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    await customer.destroy();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};

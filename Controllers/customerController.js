const Customer = require('../Models/customerModel');
const User = require('../Models/userModel');
const Order = require('../Models/orderModel');
const Booking = require('../Models/bookingModel');

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

// ✅ Controller functions
// const createCustomer = async (req, res) => {
//   try {
//     const { userId, name, email, phone } = req.body;

//     if (!userId || !name || !email) {
//       return res.status(400).json({ error: 'userId, name, and email are required' });
//     }

//     const stats = await computeCustomerStats(userId);
//     if (!stats.isCustomer) {
//       return res.status(400).json({ error: 'User has no orders or bookings yet' });
//     }

//     const customer = await Customer.create({
//       userId,
//       name,
//       email,
//       phone,
//       orders: stats.orders,
//       totalSpent: stats.totalSpent
//     });

//     res.status(201).json(customer);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// const getCustomers = async (req, res) => {
//   try {
//     const customers = await Customer.findAll();
//     const filtered = [];

//     for (const customer of customers) {
//       const stats = await computeCustomerStats(customer.userId);
//       if (stats.isCustomer) {
//         filtered.push({ ...customer.toJSON(), ...stats });
//       }
//     }

//     res.status(200).json(filtered);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();

    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const stats = await computeCustomerStats(customer.userId);
        if (!stats.isCustomer) return null; // skip users with no orders/bookings
        return { ...customer.toJSON(), ...stats };
      })
    );

    // Remove nulls
    const filtered = customersWithStats.filter(c => c !== null);

    res.status(200).json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

// ✅ Export all controllers
module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};

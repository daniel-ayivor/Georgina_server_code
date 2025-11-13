const Customer = require('../Models/customerModel');
const User = require('../Models/userModel');
const Order = require('../Models/orderModel');
const Booking = require('../Models/bookingModel');

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    const filtered = [];

    for (const customer of customers) {
      const stats = await computeCustomerStats(customer.userId);
      if (stats.isCustomer) {
        filtered.push({ ...customer.toJSON(), ...stats });
      }
    }

    res.status(200).json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
;


exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    await customer.update(req.body);
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    await customer.destroy();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 
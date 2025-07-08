const OrderItem = require('../Models/orderItemModel');

exports.createOrderItem = async (req, res) => {
  try {
    const orderItem = await OrderItem.create(req.body);
    res.status(201).json(orderItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getOrderItems = async (req, res) => {
  try {
    const orderItems = await OrderItem.findAll();
    res.status(200).json(orderItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderItemById = async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);
    if (!orderItem) return res.status(404).json({ error: 'OrderItem not found' });
    res.status(200).json(orderItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderItem = async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);
    if (!orderItem) return res.status(404).json({ error: 'OrderItem not found' });
    await orderItem.update(req.body);
    res.status(200).json(orderItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteOrderItem = async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);
    if (!orderItem) return res.status(404).json({ error: 'OrderItem not found' });
    await orderItem.destroy();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 
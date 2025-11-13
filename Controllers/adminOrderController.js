const Order = require('../Models/orderModel');
const OrderItem = require('../Models/orderItemModel');
const User = require('../Models/userModel');

// Get all orders (admin only)

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user', // Add this alias - must match your Order model association
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'items'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Get order by ID (admin - can access any order)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user', // Add this alias
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    await order.update({ status });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Delete order (admin only)
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    await order.destroy();

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Get order statistics (admin only)
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const completedOrders = await Order.count({ where: { status: 'completed' } });
    const totalRevenue = await Order.sum('totalAmount', { where: { status: 'completed' } });

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
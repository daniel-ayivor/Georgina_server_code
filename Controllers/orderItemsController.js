// Controllers/orderItemController.js
const OrderItem = require('../Models/orderItemModel');
const Order = require('../Models/orderModel');
const User = require('../Models/userModel');
const Product = require('../Models/productModel'); // ADD THIS LINE



exports.getOrderItems = async (req, res) => {
  try {
    const orderItems = await OrderItem.findAll({
      include: [
        {
          model: Order,
          as: 'order', // This matches OrderItem.associate alias
          include: [{
            model: User,
            as: 'user', // This matches Order.associate alias
            attributes: ['id', 'name', 'email']
          }]
        },
        {
          model: Product,
          as: 'product' // This matches OrderItem.associate alias
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: orderItems
    });
  } catch (err) {
    console.error('Error in getOrderItems:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.getOrderItemById = async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [{
            model: User,
            as: 'user', // Add this alias
            attributes: ['id', 'name', 'email']
          }]
        },
        {
          model: Product,
          as: 'product'
        }
      ]
    });
    
    if (!orderItem) {
      return res.status(404).json({ 
        success: false,
        error: 'OrderItem not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: orderItem
    });
  } catch (err) {
    console.error('Error in getOrderItemById:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.createOrderItem = async (req, res) => {
  try {
    const orderItem = await OrderItem.create(req.body);
    res.status(201).json({
      success: true,
      data: orderItem
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

// exports.getOrderItems = async (req, res) => {
//   try {
//     const orderItems = await OrderItem.findAll({
//       include: [
//         {
//           model: Order,
//           include: [{
//             model: User,
//             attributes: ['id', 'name', 'email']
//           }]
//         }
//       ]
//     });
//     res.status(200).json({
//       success: true,
//       data: orderItems
//     });
//   } catch (err) {
//     res.status(500).json({ 
//       success: false,
//       error: err.message 
//     });
//   }
// };

// exports.getOrderItemById = async (req, res) => {
//   try {
//     const orderItem = await OrderItem.findByPk(req.params.id, {
//       include: [
//         {
//           model: Order,
//           include: [{
//             model: User,
//             attributes: ['id', 'name', 'email']
//           }]
//         }
//       ]
//     });
//     if (!orderItem) return res.status(404).json({ 
//       success: false,
//       error: 'OrderItem not found' 
//     });
//     res.status(200).json({
//       success: true,
//       data: orderItem
//     });
//   } catch (err) {
//     res.status(500).json({ 
//       success: false,
//       error: err.message 
//     });
//   }
// };

exports.updateOrderItem = async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);
    if (!orderItem) return res.status(404).json({ 
      success: false,
      error: 'OrderItem not found' 
    });
    await orderItem.update(req.body);
    res.status(200).json({
      success: true,
      data: orderItem
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.deleteOrderItem = async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);
    if (!orderItem) return res.status(404).json({ 
      success: false,
      error: 'OrderItem not found' 
    });
    await orderItem.destroy();
    res.status(200).json({
      success: true,
      message: 'Order item deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
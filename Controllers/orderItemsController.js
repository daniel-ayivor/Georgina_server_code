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
    
    console.log('=== getOrderItems Debug ===');
    console.log('Total orderItems found:', orderItems.length);
    orderItems.forEach((item, index) => {
      console.log(`OrderItem ${index + 1}:`, {
        id: item.id,
        orderId: item.orderId,
        orderNumber: item.order?.orderNumber,
        productName: item.product?.name,
        quantity: item.quantity
      });
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
    
    console.log('=== getOrderItemById Debug ===');
    console.log('Requested ID:', req.params.id);
    if (orderItem) {
      console.log('OrderItem found:', {
        id: orderItem.id,
        orderId: orderItem.orderId,
        orderNumber: orderItem.order?.orderNumber,
        orderData: orderItem.order,
        productName: orderItem.product?.name,
        quantity: orderItem.quantity
      });
    } else {
      console.log('OrderItem not found');
    }
    
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
    console.log('=== createOrderItem Debug ===');
    console.log('Request body:', req.body);
    
    const orderItem = await OrderItem.create(req.body);
    
    console.log('Created orderItem:', {
      id: orderItem.id,
      orderId: orderItem.orderId,
      productId: orderItem.productId,
      quantity: orderItem.quantity
    });
    
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
    console.log('=== updateOrderItem Debug ===');
    console.log('OrderItem ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const orderItem = await OrderItem.findByPk(req.params.id);
    if (!orderItem) return res.status(404).json({ 
      success: false,
      error: 'OrderItem not found' 
    });
    
    console.log('Before update:', orderItem.toJSON());
    await orderItem.update(req.body);
    console.log('After update:', orderItem.toJSON());
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
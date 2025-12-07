const Order = require('../Models/orderModel');
const OrderItem = require('../Models/orderItemModel');
const Product = require('../Models/productModel');
const User = require('../Models/userModel');



const userOrderController = {
  // Create a new order
  createOrder: async (req, res) => {
    try {
      const userId = req.user.id; // From authentication middleware
      const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

      console.log('🔐 Creating order for user:', userId);
      console.log('📦 Order items:', items);

      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Order items are required"
        });
      }

      // Create the order
      const order = await Order.create({
        userId,
        totalAmount,
        shippingAddress,
        paymentMethod,
        status: 'pending'
      });

      // Create order items
      const orderItems = await OrderItem.bulkCreate(
        items.map(item => ({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        }))
      );

      // Fetch the complete order with items
      const completeOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product'
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: completeOrder
      });

    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        message: "Failed to create order"
      });
    }
  },

// Get user's orders
getMyOrders: async (req, res) => {
  try {
    const userId = req.user.id; // From authentication middleware

    console.log('🔐 Fetching orders for user:', userId);

    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'images'] // ← CHANGED 'image' to 'images'
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('✅ Found orders:', orders.length);

    res.json({
      success: true,
      data: orders,
      message: "Orders retrieved successfully"
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
},
  // Get specific order by orderNumber
  getOrderById: async (req, res) => {
    try {
      const userId = req.user.id;
      const orderNumber = req.params.id; // Now expecting orderNumber instead of id

      console.log('🔐 Fetching order:', orderNumber, 'for user:', userId);

      const order = await Order.findOne({
        where: { 
          orderNumber,
          userId // Ensure the order belongs to the user
        },
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price', 'image']
              }
            ]
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      res.json({
        success: true,
        data: order,
        message: "Order retrieved successfully"
      });

    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch order"
      });
    }
  },

  // Cancel order
  cancelOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const orderNumber = req.params.id; // Now expecting orderNumber

      console.log('🔐 Cancelling order:', orderNumber, 'for user:', userId);

      const order = await Order.findOne({
        where: { 
          orderNumber,
          userId // Ensure the order belongs to the user
        }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      // Check if order can be cancelled
      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Order cannot be cancelled. Current status: ${order.status}`
        });
      }

      // Update order status
      await order.update({ status: 'cancelled' });

      res.json({
        success: true,
        message: "Order cancelled successfully",
        data: order
      });

    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel order"
      });
    }
  },

  // Delete order (only pending orders can be deleted)
  deleteOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const orderNumber = req.params.id;

      console.log('🔐 Deleting order:', orderNumber, 'for user:', userId);

      const order = await Order.findOne({
        where: { 
          orderNumber,
          userId // Ensure the order belongs to the user
        }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      // Only allow deletion of pending or cancelled orders
      if (!['pending', 'cancelled'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Order cannot be deleted. Only pending or cancelled orders can be deleted. Current status: ${order.status}`
        });
      }

      // Delete associated order items first
      await OrderItem.destroy({
        where: { orderId: order.id }
      });

      // Delete the order
      await order.destroy();

      res.json({
        success: true,
        message: "Order deleted successfully"
      });

    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({
        success: false,
        message: "Failed to delete order"
      });
    }
  }
};

module.exports = userOrderController;
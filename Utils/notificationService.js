const Notification = require('../Models/notificationModel');

class NotificationService {
  // Create automatic notification
  static async createAutoNotification({ title, message, type, metadata = {} }) {
    try {
      const notification = await Notification.create({
        title,
        description: message,
        message,
        type,
        metadata,
        read: false
      });
      
      console.log(`✅ Notification created: ${title}`);
      return notification;
    } catch (error) {
      console.error('Error creating automatic notification:', error);
      throw error;
    }
  }

  // Order notifications
  static async notifyNewOrder(order) {
    return this.createAutoNotification({
      title: 'New Order Received',
      message: `Order #${order.id} for $${order.totalAmount} has been placed`,
      type: 'order',
      metadata: { orderId: order.id, amount: order.totalAmount }
    });
  }

  static async notifyOrderStatusChange(order, oldStatus, newStatus) {
    return this.createAutoNotification({
      title: 'Order Status Updated',
      message: `Order #${order.id} status changed from ${oldStatus} to ${newStatus}`,
      type: 'order',
      metadata: { orderId: order.id, oldStatus, newStatus }
    });
  }

  // Booking notifications
  static async notifyNewBooking(booking) {
    return this.createAutoNotification({
      title: 'New Booking Request',
      message: `New ${booking.serviceType} booking for ${booking.date} at ${booking.time}`,
      type: 'booking',
      metadata: { bookingId: booking.id, serviceType: booking.serviceType }
    });
  }

  static async notifyBookingStatusChange(booking, oldStatus, newStatus) {
    return this.createAutoNotification({
      title: 'Booking Status Updated',
      message: `Booking #${booking.id} status changed from ${oldStatus} to ${newStatus}`,
      type: 'booking',
      metadata: { bookingId: booking.id, oldStatus, newStatus }
    });
  }

  // Contact notifications
  static async notifyNewContactMessage(contact) {
    return this.createAutoNotification({
      title: 'New Contact Message',
      message: `New message from ${contact.name} (${contact.email})`,
      type: 'contact',
      metadata: { contactId: contact.id, email: contact.email }
    });
  }

  // Product notifications
  static async notifyLowStock(product) {
    return this.createAutoNotification({
      title: 'Low Stock Alert',
      message: `Product "${product.name}" is running low (${product.stock} remaining)`,
      type: 'product',
      metadata: { productId: product.id, stock: product.stock }
    });
  }

  static async notifyOutOfStock(product) {
    return this.createAutoNotification({
      title: 'Out of Stock Alert',
      message: `Product "${product.name}" is out of stock`,
      type: 'product',
      metadata: { productId: product.id, stock: product.stock }
    });
  }

  // System notifications
  static async notifySystemAlert(message, metadata = {}) {
    return this.createAutoNotification({
      title: 'System Alert',
      message,
      type: 'system',
      metadata
    });
  }
}

module.exports = NotificationService;
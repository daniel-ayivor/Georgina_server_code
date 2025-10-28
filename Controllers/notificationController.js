// Controllers/notificationController.js
const Notification = require('../Models/notificationModel');

// Create Notification
exports.createNotification = async (req, res) => {
  try {
    const { title, description, message, type, userId, metadata } = req.body;
    
    const notification = await Notification.create({
      title,
      description,
      message: message || description,
      type,
      userId,
      metadata,
      read: false
    });
    
    res.status(201).json(notification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get All Notifications
exports.getNotifications = async (req, res) => {
  try {
    const { type, read, limit = 50, offset = 0 } = req.query;
    
    const where = {};
    if (type) where.type = type;
    if (read !== undefined) where.read = read === 'true';
    
    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get Unread Notifications
exports.getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { read: false },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error fetching unread notifications:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get Notification Stats
exports.getNotificationStats = async (req, res) => {
  try {
    const total = await Notification.count();
    const unread = await Notification.count({ where: { read: false } });
    
    res.status(200).json({
      total,
      unread
    });
  } catch (err) {
    console.error('Error fetching notification stats:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get Notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.status(200).json(notification);
  } catch (err) {
    console.error('Error fetching notification:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update Notification
exports.updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    await notification.update(req.body);
    res.status(200).json(notification);
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(400).json({ error: err.message });
  }
};

// Mark Notification as Read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    await notification.update({ read: true });
    res.status(200).json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(400).json({ error: err.message });
  }
};

// Mark All Notifications as Read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { read: false } }
    );
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete Notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    await notification.destroy();
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: err.message });
  }
};
const express = require('express');
const router = express.Router();
const notificationController = require('../Controllers/notificationController');
const { authenticate } = require('../Middleware/Middelware');

router.post('/api/notifications', authenticate, notificationController.createNotification);
router.get('/api/notifications', authenticate, notificationController.getNotifications);
router.get('/api/notifications/:id', authenticate, notificationController.getNotificationById);
router.put('/api/notifications/:id', authenticate, notificationController.updateNotification);
router.delete('/api/notifications/:id', authenticate, notificationController.deleteNotification);

module.exports = router; 
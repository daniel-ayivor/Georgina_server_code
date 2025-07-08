const express = require('express');
const router = express.Router();
const notificationController = require('../Controllers/notificationController');
const { authenticate } = require('../Middleware/Middelware');

router.post('/', authenticate, notificationController.createNotification);
router.get('/', authenticate, notificationController.getNotifications);
router.get('/:id', authenticate, notificationController.getNotificationById);
router.put('/:id', authenticate, notificationController.updateNotification);
router.delete('/:id', authenticate, notificationController.deleteNotification);

module.exports = router; 
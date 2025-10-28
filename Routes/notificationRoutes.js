// Routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../Middleware/Middelware');

// Debug the import
console.log('🔔 Attempting to require notificationController...');
try {
  const notificationController = require('../Controllers/notificationController');
  console.log('✅ NotificationController loaded:', notificationController);
  console.log('📋 Available functions:', Object.keys(notificationController));
  
  // Verify each function exists
  const requiredFunctions = [
    'createNotification', 'getNotifications', 'getUnreadNotifications',
    'getNotificationById', 'updateNotification', 'markAsRead',
    'markAllAsRead', 'deleteNotification', 'getNotificationStats'
  ];
  
  requiredFunctions.forEach(funcName => {
    if (notificationController[funcName]) {
      console.log(`✅ ${funcName} function found`);
    } else {
      console.log(`❌ ${funcName} function missing`);
    }
  });

  // Notification routes
  router.post('/api/notifications', authenticate, notificationController.createNotification);
  router.get('/api/notifications', notificationController.getNotifications);
  router.get('/api/notifications/unread', authenticate, notificationController.getUnreadNotifications);
  router.get('/api/notifications/stats', authenticate, notificationController.getNotificationStats);
  router.get('/api/notifications/:id', authenticate, notificationController.getNotificationById);
  router.put('/api/notifications/:id', authenticate, notificationController.updateNotification);
  router.patch('/api/notifications/:id/read', authenticate, notificationController.markAsRead);
  router.patch('/api/notifications/mark-all-read', authenticate, notificationController.markAllAsRead);
  router.delete('/api/notifications/:id', authenticate, notificationController.deleteNotification);
  
  console.log('✅ All notification routes registered successfully');
  
} catch (error) {
  console.error('❌ Error loading notificationController:', error);
  console.error('🔍 Error details:', error.message);
  console.error('📚 Error stack:', error.stack);
}

module.exports = router;
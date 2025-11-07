// routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const {
  getOrCreateSession,
  sendMessage,
  getChatHistory,
  markAsRead,
  getUnreadCount
} = require('../Controllers/chatbotController');

// Apply rate limiting if you have it
// const { chatLimiter } = require('../middleware/rateLimit');

// Public chatbot routes (no authentication required)
router.get('/api/chat/session/:sessionId', getOrCreateSession);
router.post('/api/chat/send', sendMessage); // Add chatLimiter here if needed
router.get('/api/chat/history/:sessionId', getChatHistory);
router.patch('/api/chat/read/:sessionId', markAsRead);
router.get('/api/chat/unread/:sessionId', getUnreadCount);

// Create new session (redirect to session endpoint)
router.get('/api/chat/session', (req, res) => {
  res.redirect('/api/chat/session/new');
});

module.exports = router;
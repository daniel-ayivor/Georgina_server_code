// Routes/contactRoute.js
const express = require('express');
const router = express.Router();

// Debug the import
console.log('Attempting to require contactController...');
try {
  const contactController = require('../Controllers/ContactController');
  console.log('ContactController loaded successfully:', contactController);
  console.log('Functions available:', Object.keys(contactController));
  
  // Verify each function exists
  if (contactController.submitContactForm) {
    console.log('submitContactForm function found');
  } else {
    console.log('submitContactForm function missing');
  }
  
  if (contactController.getAllMessages) {
    console.log(' getAllMessages function found');
  } else {
    console.log(' getAllMessages function missing');
  }
  
  if (contactController.getMessageById) {
    console.log(' getMessageById function found');
  } else {
    console.log('getMessageById function missing');
  }
  
  if (contactController.deleteMessage) {
    console.log('deleteMessage function found');
  } else {
    console.log('deleteMessage function missing');
  }

  // Public route to submit contact form
  router.post('/api/contact', contactController.submitContactForm);  
  router.get('/api/admin/contact/messages', contactController.getAllMessages);
  router.get('/api/admin/contact/messages/:id', contactController.getMessageById);
  router.delete('/api/admin/contact/messages/:id', contactController.deleteMessage);
  
  console.log('All contact routes registered successfully');
  
} catch (error) {
  console.error(' Error loading contactController:', error);
  console.error('Error details:', error.message);
  console.error('Error stack:', error.stack);
}

module.exports = router;
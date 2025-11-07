// Controllers/ContactController.js
const Contact = require("../Models/contact");

// Create Contact
const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;  
    console.log('Creating contact message:', { name, email });
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        message: 'All fields are required: name, email, message' 
      });
    }   
    
    // Create contact message
    const contact = await Contact.create({ 
      name: name.trim(),
      email: email.trim(),
      message: message.trim()
    });   
    
    console.log('✅ Contact message created successfully with ID:', contact.id);
    res.status(201).json({ 
      message: 'Contact message created successfully', 
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        message: contact.message,
        createdAt: contact.createdAt
      }
    });
  } catch (err) {
    console.error('Error creating contact message:', err);
    res.status(500).json({
      message: 'Internal server error while creating contact message'
    });
  } 
};

// Get All Contacts
const getAllMessages = async (req, res) => {
  try { 
    const contacts = await Contact.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }     
};

// Get Contact by ID
const getMessageById = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }
    res.status(200).json(contact);
  } catch (err) { 
    res.status(500).json({ error: err.message });
  }
};

// Delete Contact
const deleteMessage = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });  
    }
    await contact.destroy();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ CORRECT EXPORT - Make sure this is at the end of the file
module.exports = {
  submitContactForm,
  getAllMessages,
  getMessageById,
  deleteMessage
};
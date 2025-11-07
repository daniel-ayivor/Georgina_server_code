// To this:
const ChatMessage = require('../Models/chatbot');

const { Op } = require('sequelize');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// Get or create chat session
const getOrCreateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Verify database connection
    if (!ChatMessage || !ChatMessage.sequelize) {
      throw new Error('Database models not properly initialized');
    }

    let session = sessionId;
    if (!sessionId || sessionId === 'new' || sessionId === 'undefined') {
      session = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get existing messages for this session
    const messages = await ChatMessage.findAll({
      where: { sessionId: session },
      order: [['timestamp', 'ASC']],
      limit: 50
    });

    // If no messages, create welcome message
    if (messages.length === 0) {
      const welcomeMessage = await ChatMessage.create({
        sessionId: session,
        message: "Hello! I'm Georgina, your cleaning service assistant. I can help you with booking cleanings, checking prices, or answering any questions about our services. What would you like to know?",
        sender: 'bot',
        messageType: 'text',
        metadata: {
          quickReplies: [
            "What services do you offer?",
            "How do I book a cleaning?",
            "What are your prices?",
            "Contact support"
          ]
        }
      });
      messages.push(welcomeMessage);
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: session,
        messages
      }
    });
  } catch (error) {
    console.error('Error getting chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat session',
      error: error.message
    });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { sessionId, message, metadata } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required'
      });
    }

    // Verify database connection
    if (!ChatMessage || !ChatMessage.sequelize) {
      throw new Error('Database models not properly initialized');
    }

    // Get conversation history for context
    const conversationHistory = await ChatMessage.findAll({
      where: { sessionId },
      order: [['timestamp', 'ASC']],
      limit: 10
    });

    // Save user message
    const userMessage = await ChatMessage.create({
      sessionId,
      message: message.trim(),
      sender: 'user',
      messageType: 'text',
      metadata: metadata || null
    });

    // Generate AI response
    const botResponse = await generateBotResponse(message, sessionId, conversationHistory);

    // Save bot response
    const botMessage = await ChatMessage.create(botResponse);

    // Get updated conversation
    const messages = await ChatMessage.findAll({
      where: { sessionId },
      order: [['timestamp', 'ASC']],
      limit: 50
    });

    res.status(200).json({
      success: true,
      data: {
        userMessage,
        botMessage,
        messages,
        sessionId
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};
// Get or create chat session


// Enhanced bot response with AI
const generateBotResponse = async (userMessage, sessionId, conversationHistory = []) => {
  try {
    // Prepare conversation context
    const messages = [
      {
        role: "system",
        content: `You are a helpful customer service assistant for a professional cleaning service company called "Georgina Cleaning Service". 

Company Information:
- Services: Office Cleaning, Kitchen Cleaning, Bathroom Cleaning, Dusting Service, Mopping Service, Vacuuming Service
- Pricing: Office $150, Kitchen $200, Bathroom $100, Dusting $80, Mopping $90, Vacuuming $85
- Contact: Phone +233 123 456 789, Email support@cleaningservice.com
- Address: 123 Market Street, Accra, Ghana
- Hours: Mon-Fri 8am-6pm, Sat 9am-4pm

Guidelines:
- Be friendly, professional, and helpful
- Keep responses concise but informative
- If you don't know something, suggest contacting support
- Always maintain a positive tone
- Use emojis sparingly to make it friendly
- For booking requests, direct them to the website or phone
- For pricing questions, provide general ranges and offer custom quotes`
      },
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message
      })),
      {
        role: "user",
        content: userMessage
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    return {
      sessionId,
      message: aiResponse,
      sender: 'bot',
      messageType: 'text',
      metadata: {
        isAI: true,
        model: 'gpt-3.5-turbo'
      }
    };

  } catch (error) {
    console.error('AI API Error:', error);
    
    // Fallback to rule-based responses
    return generateFallbackResponse(userMessage, sessionId);
  }
};

// Fallback responses
const generateFallbackResponse = (userMessage, sessionId) => {
  const message = userMessage.toLowerCase().trim();
  
  let response = {
    sessionId,
    sender: 'bot',
    messageType: 'text',
    metadata: { isAI: false }
  };

  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    response.message = "Hello! 👋 Welcome to Georgina Cleaning Service. How can I help you today?";
    response.metadata.quickReplies = [
      "Book a cleaning service",
      "View pricing",
      "Contact support",
      "Service areas"
    ];
  } 
  else if (message.includes('service') || message.includes('offer')) {
    response.message = "We offer professional cleaning services including:\n\n• Office Cleaning 🏢\n• Kitchen Cleaning 🍳\n• Bathroom Cleaning 🚿\n• Dusting Service 🌬️\n• Mopping Service 🧹\n• Vacuuming Service 🧽\n\nWhich service are you interested in?";
    response.metadata.quickReplies = [
      "Office Cleaning",
      "Kitchen Cleaning",
      "Bathroom Cleaning",
      "View all services"
    ];
  }
  else if (message.includes('price') || message.includes('cost')) {
    response.message = "Our pricing starts from:\n\n• Office Cleaning: $150\n• Kitchen Cleaning: $200\n• Bathroom Cleaning: $100\n• Dusting Service: $80\n• Mopping Service: $90\n• Vacuuming Service: $85\n\nPrices may vary based on space size. Would you like a custom quote?";
    response.metadata.quickReplies = [
      "Get a custom quote",
      "Book a service",
      "View service details"
    ];
  }
  else {
    response.message = "I understand you're asking about \"" + userMessage + "\". For detailed assistance, please contact our support team at +233 123 456 789 or email support@cleaningservice.com. Is there anything else I can help you with?";
    response.metadata.quickReplies = [
      "Contact support",
      "View services",
      "Check pricing"
    ];
  }

  return response;
};

// Send a message


// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const messages = await ChatMessage.findAll({
      where: { sessionId },
      order: [['timestamp', 'ASC']],
      limit: 100
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId,
        messages,
        total: messages.length
      }
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history',
      error: error.message
    });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { sessionId } = req.params;

    await ChatMessage.update(
      { isRead: true },
      { 
        where: { 
          sessionId, 
          sender: 'user',
          isRead: false 
        } 
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const count = await ChatMessage.count({
      where: { 
        sessionId, 
        sender: 'user',
        isRead: false 
      }
    });

    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// Export ALL functions
module.exports = {
  getOrCreateSession,
  sendMessage,
  getChatHistory,
  markAsRead,
  getUnreadCount,
  generateBotResponse
};
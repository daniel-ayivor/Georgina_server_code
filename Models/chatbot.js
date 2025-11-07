const { DataTypes } = require('sequelize');
const sequelize = require('../Database/database');

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sender: {
    type: DataTypes.ENUM('user', 'bot'),
    allowNull: false
  },
  messageType: {
    type: DataTypes.ENUM('text', 'quick_reply', 'image', 'file'),
    defaultValue: 'text'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'chat_messages',
  timestamps: true,
  indexes: [
    {
      fields: ['sessionId']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['sender']
    }
  ]
});

// Add sync function
ChatMessage.sync({ force: false })
  .then(() => {
    console.log('ChatMessage table synced successfully');
  })
  .catch(err => {
    console.error('Error syncing ChatMessage table:', err);
  });

module.exports = ChatMessage;
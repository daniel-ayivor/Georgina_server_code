

const { DataTypes } = require("sequelize");
const sequelize = require("../Database/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150), 
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Please enter a valid email'
      },
      len: {
        args: [5, 150], 
        msg: 'Email must be between 5 to 150 characters'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM("user", "admin"),
    allowNull: false,
    defaultValue: "user"
  }
}, {
  tableName: "users",
  indexes: [
    {
      unique: true,
      fields: ['email'],
      name: 'unique_email_index'
    }
  ]
});

// Add associations to User model
User.associate = function(models) {
  User.hasMany(models.Order, {
    foreignKey: 'userId',
    as: 'orders' // This matches the alias in Order model
  });
};



module.exports = User;
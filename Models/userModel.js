const { DataTypes } = require("sequelize");
const sequelize = require("../Database/database");

// Sequelize Model Definition
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
            },
            async isUnique(value) {
                const user = await User.findOne({ where: { email: value } });
                if (user) {
                    throw new Error('Email already exists');
                }
            }
        }
    },
    
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM("user", "admin"), // Define role as ENUM
        allowNull: false,
        defaultValue: "user" // Default role is 'user'
    }
}, {
    tableName: "users",
    indexes: [
        {
            unique: true,
            fields: ['email'],
            name: 'unique_email_index'  // Ensure a named index
        }
    ]
});



module.exports = User;

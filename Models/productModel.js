// const { DataTypes, ENUM } = require('sequelize');
// const sequelize = require('../Database/database');

// const Product = sequelize.define('Product', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true
//     },

//     image: {
//         type: DataTypes.STRING, // Expecting a string for the file path
//         allowNull: false,
//         // Remove isUrl validation since it's a local path
//         validate: {
//             notEmpty: true, // Ensure the field is not empty
//         },
//     },
//     title: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     price: {
//         type: DataTypes.FLOAT, 
//         allowNull: false,
//         validate: {
//             isFloat: true,
//             min: 0  
//         }
//     },
//     text: {
//         type: DataTypes.TEXT, 
//         allowNull: true
//     },
//     rating: {
//         type: DataTypes.ENUM('1', '2', '3', '4', '5'), 
//         allowNull: false,
//     },
//     category: {
//         type: DataTypes.ENUM('male', 'female', 'kids', 'adults'), 
//         allowNull: false,
//     },
//     size: {
//         type: DataTypes.ENUM('XL', 'L', 'XXL', 'MEDIUM', 'SM'), 
//         allowNull: false,
//     }

// }, {
//     tableName: 'products',
//     timestamps: true 
// });

// module.exports = Product;
const { DataTypes } = require('sequelize');
const sequelize = require('../Database/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.STRING, // Use STRING to match TypeScript interface
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      isFloat: true,
      min: 0,
    },
  },
  discountPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      isFloat: true,
      min: 0,
    },
  },
  image: {
        type: DataTypes.STRING, // Expecting a string for the file path
        allowNull: false,
        // Remove isUrl validation since it's a local path
        validate: {
            notEmpty: true, // Ensure the field is not empty
        },
    },
  categoryId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subcategoryId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 5,
    },
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  size: {
    type: DataTypes.ENUM('XL', 'L', 'XXL', 'MEDIUM', 'SM'),
    allowNull: true,
  },
}, {
  tableName: 'products',
  timestamps: true,
});

module.exports = Product;

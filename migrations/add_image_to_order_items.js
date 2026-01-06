'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('order_items', 'image', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'productName' // Add after productName column
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('order_items', 'image');
  }
};

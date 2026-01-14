'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
// migration file
await queryInterface.addColumn('products', 'weight', {
  type: Sequelize.STRING,
  allowNull: true,
});

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'weight');
  }
};

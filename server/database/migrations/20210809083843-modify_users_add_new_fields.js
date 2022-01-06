'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn('users', 'deleted_at', {
        type: Sequelize.DATE,
        defaultValue: null
      })
    ];
  },

  down: async (queryInterface, Sequelize) => {
   return queryInterface.removeColumn(
      'deleted_at'
    );
  }
};

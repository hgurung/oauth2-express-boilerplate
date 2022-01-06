'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn('users', 'last_login', {
        type: Sequelize.DATE,
        defaultValue: null
      })
    ];
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'last_login'
    );
  }
};

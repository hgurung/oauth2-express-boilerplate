"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("clients", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      client_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      client_secret: {
        type: Sequelize.STRING,
        allowNull: true
      },
      grants: {
        type: Sequelize.STRING,
        allowNull: true
      },
      server_access: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2
      },
      permissions: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("clients");
  }
};
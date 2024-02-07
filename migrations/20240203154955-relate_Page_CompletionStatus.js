"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn("completionStatuses", "pageId", {
      type: Sequelize.INTEGER,
      references: {
        model: { tableName: "Pages" },
        key: "id",
      },
    });

    await queryInterface.addConstraint("completionStatuses", {
      fields: ["pageId"],
      type: "foreign key",
      name: "custom_fkey_pageId",
      references: {
        table: "Pages",
        field: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn("completionStatuses", "pageId");
  },
};

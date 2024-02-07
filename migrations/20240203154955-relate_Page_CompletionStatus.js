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

    queryInterface.addColumn("completionStatuses", "pageId", {
      type: Sequelize.INTEGER,
      references: {
        model: { tableName: "Pages" },
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    queryInterface.addConstraint("completionStatuses", {
      fields: ["pageId"],
      type: "foreign key",
      name: "custom_fkey_pageId",
      references: {
        table: "Pages",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    queryInterface.removeConstraint("completionStatuses", "custom_fkey_pageId");
  },
};

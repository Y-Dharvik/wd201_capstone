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

    await queryInterface.addColumn("Courses", "creatorId", {
      type: Sequelize.INTEGER,
      references: {
        model: { tableName: "Users" },
        key: "id",
      },
    });

    await queryInterface.addConstraint("Courses", {
      fields: ["creatorId"],
      type: "foreign key",
      name: "custom_fkey_constraint_creatorId",
      references: {
        table: "Users",
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

    await queryInterface.removeConstraint(
      "Courses",
      "custom_fkey_constraint_creatorId",
    );
    await queryInterface.removeColumn("Courses", "creatorId");
  },
};

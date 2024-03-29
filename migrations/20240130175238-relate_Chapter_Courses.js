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

    await queryInterface.addColumn("Chapters", "courseId", {
      type: Sequelize.INTEGER,
      references: {
        model: { tableName: "Courses" },
        key: "id",
      },
    });

    await queryInterface.addConstraint("Chapters", {
      fields: ["courseId"],
      type: "foreign key",
      name: "custom_fkey_constraint_courseId",
      references: {
        table: "Courses",
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
    await queryInterface.removeColumn("Chapters", "courseId");
  },
};

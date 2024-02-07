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

    await queryInterface.addColumn("Enrolls", "courseId", {
      type: Sequelize.INTEGER,
      references: {
        model: { tableName: "Courses" },
        key: "id",
      },
    });

    await queryInterface.addConstraint("Enrolls", {
      fields: ["courseId"],
      type: "foreign key",
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
    queryInterface.removeColumn("Enrolls", "courseId");
  },
};

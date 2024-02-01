'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    queryInterface.addColumn("Enrolls", "userId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    queryInterface.addColumn("Enrolls", "courseId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Courses",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    queryInterface.removeColumn(Enroll, "userId");
    queryInterface.removeColumn(Enroll, "courseId");
  }
};

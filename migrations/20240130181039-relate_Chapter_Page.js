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

      await queryInterface.addColumn("Pages", "chapterId", {
        type: Sequelize.INTEGER,
        references: {
          model: "Chapters",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });

      await queryInterface.addConstraint("Pages", {
        fields: ["chapterId"],
        type: "foreign key",
        name: "custom_fkey_constraint_chapterId",
        references: {
          table: "Chapters",
          field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
      });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
      
    await queryInterface.removeColumn("Pages", "chapterId");
  }
};

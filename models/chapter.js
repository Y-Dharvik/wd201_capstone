'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chapter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Chapter.belongsTo(models.Courses, { 
        foreignKey: "courseId" 
      });

      Chapter.hasMany(models.Page, {
        foreignKey: "chapterId"
      });
    }
  }
  Chapter.init({
    chapterNumber: DataTypes.INTEGER,
    chapterName: DataTypes.STRING,
    chapterDesc: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Chapter',
  });
  return Chapter;
};
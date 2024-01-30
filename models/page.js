'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Page extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Page.belongsTo(models.Chapter, { 
        foreignKey: "chapterId" 
      });
    }
  }
  Page.init({
    pageNumber: DataTypes.INTEGER,
    pageName: DataTypes.STRING,
    pageContent: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Page',
  });
  return Page;
};
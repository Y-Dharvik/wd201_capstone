"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class completionStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      completionStatus.belongsTo(models.Page, {
        foreignKey: "pageId",
      });

      completionStatus.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
  }
  completionStatus.init(
    {
      status: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "completionStatus",
    },
  );
  return completionStatus;
};


// 'use strict';
// const {
//   Model
// } = require('sequelize');
// const Courses = require('./courses');
// const Users = require('./users');
// module.exports = (sequelize, DataTypes) => {
//   class Courses extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     models.Courses.associate = (models) => {
//       // define association here
//       Courses.belongsTo(models.Users, { 
//         foreignKey: "creatorId", through: "Courses", 
//       });
//     }
//   }

//   Courses.init({
//     courseName: DataTypes.STRING,
//     desc: DataTypes.STRING
//   }, {
//     sequelize,
//     modelName: 'Courses',
//   });
//   return Courses;
// };
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Courses extends Model {
    static associate(models) {
      Courses.belongsTo(models.User, {
        foreignKey: "creatorId",
        onDelete: "CASCADE",
      });

      Courses.hasMany(models.Chapter, {
        foreignKey: "courseId",
        onDelete: "CASCADE",
      });

      Courses.hasMany(models.Enroll, {
        foreignKey: "courseId",
        onDelete: "CASCADE",
      });
    }

    static async addCourse(courseName, desc, creatorId) {
      return this.create({
        courseName: courseName,
        desc: desc,
        creatorId: creatorId,
      });
    }
  }
  Courses.init(
    {
      courseName: DataTypes.STRING,
      desc: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Courses",
    },
  );
  return Courses;
};

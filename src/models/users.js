const { Sequelize, sequelize } = require("./index");

const { Model, DataTypes } = require("sequelize");

const { TYPES_FIELD, ROLE_FIELD, STATUS_FIELD } = require("../helper/constant");

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      // allowNull: false,
      unique: false,
    },
    email: {
      type: DataTypes.STRING,
      // allowNull: false,
      unique: false,
    },
    password: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      unique: false,
      // allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(TYPES_FIELD.EMPLOYEE, TYPES_FIELD.ORGANISATION),
      validate: {
        isValidType(value) {
          if (
            ![TYPES_FIELD.EMPLOYEE, TYPES_FIELD.ORGANISATION].includes(value)
          ) {
            throw new Error("Invalid Type");
          }
        },
      },
    },
    role: {
      type: DataTypes.ENUM(
        ROLE_FIELD.JUNIOR,
        ROLE_FIELD.SENIOR,
        ROLE_FIELD.TEAMLEADER,
        ROLE_FIELD.PROJECT_MANAGER
      ),
      validate: {
        isValidType(value) {
          if (
            ![
              ROLE_FIELD.JUNIOR,
              ROLE_FIELD.SENIOR,
              ROLE_FIELD.TEAMLEADER,
              ROLE_FIELD.PROJECT_MANAGER,
            ].includes(value)
          ) {
            throw new Error("Invalid Role");
          }
        },
      },
    },
    status: {
      type: DataTypes.ENUM(
        STATUS_FIELD.ACTIVE,
        STATUS_FIELD.CLOSED,
        STATUS_FIELD.INVITED,
        STATUS_FIELD.DELETED,
        STATUS_FIELD.PENDING,
        STATUS_FIELD.DEACTIVE,
        STATUS_FIELD.VERIFIED
      ),
      defaultValue: STATUS_FIELD.PENDING,
      validate: {
        isValidType(value) {
          if (
            ![
              STATUS_FIELD.ACTIVE,
              STATUS_FIELD.CLOSED,
              STATUS_FIELD.INVITED,
              STATUS_FIELD.DELETED,
              STATUS_FIELD.PENDING,
              STATUS_FIELD.DEACTIVE,
              STATUS_FIELD.VERIFIED,
            ].includes(value)
          ) {
            throw new Error("Invalid Status");
          }
        },
      },
    },
    otp: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// User.sync({ force: true });
// sequelize.sync({ force: true })

module.exports = User;

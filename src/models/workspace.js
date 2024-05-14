const { Model, DataTypes } = require("sequelize");

const { Sequelize, sequelize } = require("./index");

const User = require("../models/users");

const { STATUS_FIELD } = require("../helper/constant");

class Workspace extends Model {}

Workspace.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: false,
      // allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        STATUS_FIELD.ACTIVE,
        STATUS_FIELD.CLOSED,
        STATUS_FIELD.INVITED,
        STATUS_FIELD.DELETED,
        STATUS_FIELD.PENDING,
        STATUS_FIELD.DEACTIVE
      ),
      defaultValue: "Pending",
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
            ].includes(value)
          ) {
            throw new Error("Invalid Status");
          }
        },
      },
    },
    organisation_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Workspace",
    tableName: "workspaces",
  }
);
Workspace.belongsTo(User, { foreignKey: "createdBy" });

// Workspace.sync({ force: true });

module.exports = Workspace;

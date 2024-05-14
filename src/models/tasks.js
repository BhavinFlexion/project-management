const { Sequelize, sequelize } = require("./index");

const { Model, DataTypes } = require("sequelize");

const User = require("./users");

const Project = require("./projects");

const { STATUS_FIELD } = require("../helper/constant");

class Task extends Model {}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    progress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Project,
        key: "id",
      },
    },
    estimationTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    spendTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Task",
    tableName: "tasks",
  }
);

Task.belongsTo(User, {foreignKey: "createdBy",constraints: false,as: "creator",});
Task.belongsTo(User, {foreignKey: "assignedTo",constraints: false,as: "assignee",});
Task.belongsTo(Project, { foreignKey: "projectId", constraints: false });

module.exports = Task;
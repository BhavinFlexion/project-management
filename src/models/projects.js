const { Model, DataTypes } = require("sequelize");

const { sequelize } = require("./index");

const User = require("./users");

const workspaceusers = require("./workspaceusers");

const Workspace = require("./workspace");

const { STATUS_FIELD, ROLE_FIELD,PERMISSION_TYPES,} = require("../helper/constant");

class Project extends Model {}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
      defaultValue: "Active",
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
    permissions: {
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [Object.values(PERMISSION_TYPES)],
          msg: "Invalid permission type",
        },
      },
    },
    role: {
      type: DataTypes.ENUM(
        ROLE_FIELD.OWNER,
        ROLE_FIELD.MANAGER
      ),
      defaultValue: "Owner",
      validate: {
        isValidType(value) {
          if (
            ![ROLE_FIELD.OWNER, ROLE_FIELD.MANAGER].includes(
              value
            )
          ) {
            throw new Error("Invalid Role");
          }
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    workspaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: workspaceusers,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Project",
    tableName: "projects",
    timestamps: true,
  }
);

Project.belongsTo(User, { foreignKey: "userId", constraints: false });
Project.belongsTo(Workspace, { foreignKey: 'workspaceId', constraints: false  });

// sequelize.sync({force:true});

module.exports = Project;

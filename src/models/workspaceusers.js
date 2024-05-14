const { Model, DataTypes } = require("sequelize");

const { sequelize } = require("./index");

const User = require("./users");

const Workspace = require("./workspace");

const { ROLE_FIELD, STATUS_FIELD } = require("../helper/constant");

class UserWorkspace extends Model {}

UserWorkspace.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    workspaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Workspace,
        key: "id",
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
    role: {
      type: DataTypes.ENUM(
        ROLE_FIELD.OWNER,
        ROLE_FIELD.MANAGER,
        ROLE_FIELD.MEMBER
      ),
      validate: {
        isValidType(value) {
          if (
            ![ROLE_FIELD.OWNER, ROLE_FIELD.MANAGER, ROLE_FIELD.MEMBER].includes(
              value
            )
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
  },
  {
    sequelize,
    modelName: "UserWorkspace",
    tableName: "user_workspace",
    timestamps: true,
  }
);

Workspace.hasMany(UserWorkspace, {foreignKey: 'workspaceId' })
UserWorkspace.belongsTo(Workspace, {foreignKey: 'workspaceId' });

// UserWorkspace.sync({ force: true });

module.exports = UserWorkspace;
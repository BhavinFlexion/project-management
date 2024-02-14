const { Model, DataTypes } = require('sequelize');

const { sequelize } = require('./index');

const User = require('./users');

const { STATUS_FIELD, ROLE_FIELD, PERMISSION_TYPES } = require('../helper/constant');

class Project extends Model { }

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
        organisation: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(STATUS_FIELD.ACTIVE, STATUS_FIELD.CLOSED, STATUS_FIELD.INVITED, STATUS_FIELD.DELETED, STATUS_FIELD.PENDING, STATUS_FIELD.DEACTIVE),
            defaultValue: "Active",
            validate: {
                isValidType(value) {
                    if (![STATUS_FIELD.ACTIVE, STATUS_FIELD.CLOSED, STATUS_FIELD.INVITED, STATUS_FIELD.DELETED, STATUS_FIELD.PENDING, STATUS_FIELD.DEACTIVE].includes(value)) {
                        throw new Error('Invalid Status');
                    }
                }
            }
        },
        permissions: {
            type: DataTypes.STRING,
            validate: {
                isIn: {
                    args: [Object.values(PERMISSION_TYPES)],
                    msg: 'Invalid permission type',
                },
            },
        },
        role: {
            type: DataTypes.ENUM(ROLE_FIELD.OWNER, ROLE_FIELD.MANAGER, ROLE_FIELD.MEMBER),
            defaultValue: 'Owner',
            validate: {
                isValidType(value) {
                    if (![ROLE_FIELD.OWNER, ROLE_FIELD.MANAGER, ROLE_FIELD.MEMBER].includes(value)) {
                        throw new Error('Invalid Role');
                    }
                }
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'Project',
        tableName: 'projects',
        timestamps: true,
    }
);

Project.belongsTo(User, { foreignKey: 'userId', constraints: false });
Project.belongsTo(User, { foreignKey: 'workspaceId', constraints: false });

// Project.sync({force:true});
// sequelize.sync({force:true});

module.exports = Project;




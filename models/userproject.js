const { Sequelize, sequelize } = require('./index');

const { Model, DataTypes } = require('sequelize');

const User = require('./users');

const Project = require('./projects');

const { ROLE_FIELD, STATUS_FIELD, PERMISSION_TYPES } = require('../helper/constant');

class UserProject extends Model { }

UserProject.init(
    {
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
        permissions: {
            type: DataTypes.STRING,
            validate: {
                isIn: {
                    args: [Object.values(PERMISSION_TYPES)],
                    msg: 'Invalid permission type',
                },
            },
        },
        status: {
            type: DataTypes.ENUM(STATUS_FIELD.ACTIVE, STATUS_FIELD.CLOSED, STATUS_FIELD.INVITED, STATUS_FIELD.DELETED, STATUS_FIELD.PENDING, STATUS_FIELD.DEACTIVE),
            defaultValue: "Pending",
            validate: {
                isValidType(value) {
                    if (![STATUS_FIELD.ACTIVE, STATUS_FIELD.CLOSED, STATUS_FIELD.INVITED, STATUS_FIELD.DELETED, STATUS_FIELD.PENDING, STATUS_FIELD.DEACTIVE].includes(value)) {
                        throw new Error('Invalid Status');
                    }
                }
            }
        },
        projectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Project,
                key: 'id',
            },
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
        modelName: 'UserProject',
        tableName: 'user_projects',
    }
);

UserProject.belongsTo(User, { foreignKey: 'userId', constraints: false });

// UserProject.sync({force:true});

module.exports = UserProject;

const { celebrate, Joi, Segments } = require('celebrate');

const { TYPES_FIELD, ROLE_FIELD, STATUS_FIELD } = require('../helper/constant');

module.exports = {
    signup: () => celebrate({
        [Segments.BODY]: Joi.object().keys({
            username: Joi.string().alphanum().min(3).max(30).required(),
            email: Joi.string().email().trim(true).required(),
            password: Joi.string()
                .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+{}|:"<>?`\\-=[\\]\\\\;\',./\b\n\r\t\f]{3,30}$'))
                .min(8)
                .required(),
            firstName: Joi.string().min(3).max(30).required(),
            lastName: Joi.string().min(3).max(30).required(),
            description: Joi.string().min(3).required(),
            type: Joi.string().min(3).max(30).required().valid(TYPES_FIELD.EMPLOYEE, TYPES_FIELD.ORGANISATION),
            role: Joi.string().min(3).max(30).required().valid(ROLE_FIELD.JUNIOR, ROLE_FIELD.SENIOR, ROLE_FIELD.TEAMLEADER, ROLE_FIELD.PROJECT_MANAGER),
            status: Joi.string().min(3).max(30).required().valid(STATUS_FIELD.ACTIVE, STATUS_FIELD.CLOSED, STATUS_FIELD.INVITED, STATUS_FIELD.DELETED, STATUS_FIELD.PENDING, STATUS_FIELD.DEACTIVE),
        })
    }),
    signIn: () => celebrate({
        [Segments.BODY]: Joi.object().keys({
            username: Joi.string().alphanum().min(3).max(30).required(),
            email: Joi.string().email().trim(true).required(),
            password: Joi.string()
                .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+{}|:"<>?`\\-=[\\]\\\\;\',./\b\n\r\t\f]{3,30}$'))
                .min(8)
                .required(),
        })
    }),
    Workspaceupdate: () => celebrate({
        [Segments.BODY]: Joi.object().keys({
            name: Joi.string().min(3).max(30).required(),
            description: Joi.string().min(3).required(),
            status: Joi.string().alphanum().min(3).max(30).required().valid(STATUS_FIELD.ACTIVE, STATUS_FIELD.CLOSED, STATUS_FIELD.INVITED, STATUS_FIELD.DELETED, STATUS_FIELD.PENDING, STATUS_FIELD.DEACTIVE),

        })
    }),
    createProjectupdate: () => celebrate({
        [Segments.BODY]: Joi.object().keys({
            name: Joi.string().min(3).max(30).required(),
            organisation: Joi.string().min(3).max(30).required(),
            role: Joi.string().min(3).max(30).required().valid(ROLE_FIELD.OWNER, ROLE_FIELD.MANAGER, ROLE_FIELD.MEMBER),
            permissions: Joi.string().min(3).max(30).required(),
            status: Joi.string().min(3).max(30).required().valid(STATUS_FIELD.ACTIVE, STATUS_FIELD.CLOSED, STATUS_FIELD.INVITED, STATUS_FIELD.DELETED, STATUS_FIELD.PENDING, STATUS_FIELD.DEACTIVE),
        })
    }),
    createuserProjectupdate: () => celebrate({
        [Segments.BODY]: Joi.object().keys({
            role: Joi.string().min(3).max(30).required().valid(ROLE_FIELD.OWNER, ROLE_FIELD.MANAGER, ROLE_FIELD.MEMBER),
            permissions: Joi.string().min(3).max(30).required(),
            projectId: Joi.number().integer().required(),
            status: Joi.string().min(3).max(30).required().valid(STATUS_FIELD.ACTIVE, STATUS_FIELD.CLOSED, STATUS_FIELD.INVITED, STATUS_FIELD.DELETED, STATUS_FIELD.PENDING, STATUS_FIELD.DEACTIVE),
        })
    }),
    createtasksupdate: () => celebrate({
        [Segments.BODY]: Joi.object().keys({
            title: Joi.string().min(3).max(30).required(),
            description: Joi.string().min(3).required(),
            status: Joi.string().min(3).max(30).required().valid(STATUS_FIELD.ACTIVE, STATUS_FIELD.CLOSED, STATUS_FIELD.INVITED, STATUS_FIELD.DELETED, STATUS_FIELD.PENDING, STATUS_FIELD.DEACTIVE),
            progress: Joi.string().min(3).max(30).required(),
            projectId: Joi.number().integer().required(),
            estimationTime: Joi.string().required(),
            spendTime: Joi.string().required(),
        })
    }),
    Commentupdate: () => celebrate({
        [Segments.BODY]: Joi.object().keys({
            comment: Joi.string().min(3).required(),
            taskId: Joi.string().required(),
            status: Joi.string().min(3).max(30).required().valid(STATUS_FIELD.ACTIVE, STATUS_FIELD.CLOSED, STATUS_FIELD.INVITED, STATUS_FIELD.DELETED, STATUS_FIELD.PENDING, STATUS_FIELD.DEACTIVE),
        })
    }),
};
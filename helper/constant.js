const PERMISSION_TYPES = {
    MEMBER_ADD: 'Member_Add',
    MEMBER_REMOVE: 'Member_Remove',
    TASK_ADD: 'Task_Add',
    TASK_REMOVE: 'Task_Remove',
    TASK_ASSIGN: 'Task_Assign',
    COMMENT_ADD: 'Comment_Add',
    COMMENT_REMOVE: 'Comment_Remove',
    COMMENT_UPDATE: 'Comment_Update'
};

const TYPES_FIELD = {
    EMPLOYEE: 'Employee',
    ORGANISATION: 'Organisation',
};

const ROLE_FIELD = {
    JUNIOR: 'Junior',
    SENIOR: 'Senior',
    TEAMLEADER: 'Teamleader',
    PROJECT_MANAGER: 'Project-Manager',
    OWNER: 'Owner',
    MANAGER: 'Manager',
    MEMBER: 'Member',
};

const STATUS_FIELD = {
    ACTIVE: 'Active',
    INVITED: 'Invited',
    CLOSED: 'Closed',
    DELETED: 'Deleted',
    PENDING: 'Pending',
    DEACTIVE: 'Deactive',
};

module.exports = {
    PERMISSION_TYPES,
    TYPES_FIELD,
    ROLE_FIELD,
    STATUS_FIELD
}

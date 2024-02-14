const jwt = require('jsonwebtoken');
const User = require('../models/users');

const userAuth = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(400).send({ status: false, message: 'Token is required' });
        }

        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, "secret-key", { ignoreExpiration: true });

        const userData = await User.findOne({ where: { id: decoded.userId } });
        if (!userData) {
            return res.status(400).send({ status: false, message: 'Token is invalid' });
        }

        req.token = token;
        req.user = userData;
        next();
    } catch (e) {
        console.error(e);
        return res.status(400).send({ status: false, message: e.message });
    }
};

module.exports = userAuth;
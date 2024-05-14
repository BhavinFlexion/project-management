const express = require("express");

const port = 3001;

const bodyParser = require('body-parser');

const cors = require('cors');

var DB = require("./src/models/index");

const userAuth = require("./src/middleware/userAuth");

const i18n = require("./src/helper/i18n");

DB.sequelize.sync({ alter: true }).then(() => {
    console.log("Table re-synced");
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors())
app.use(i18n.init);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.all('/private/*', userAuth)

app.use('/private', require('./src/routes/private'));

app.use('/public', require('./src/routes/public'));

app.listen(port, (err) => {
    if (err) {
        console.log(err);
        return false;
    }
    console.log("sever is running on localhost:", port);
});
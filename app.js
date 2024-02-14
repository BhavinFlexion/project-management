const express = require("express");

const port = 3001;

const bodyParser = require('body-parser');

var DB = require("./models/index");
const userAuth = require("./middleware/userAuth");

DB.sequelize.sync({ alter: true }).then(() => {
    console.log("Table re-synced");
});

const app = express();

app.use(express.urlencoded({ extended: false }));

app.all('/private/*', userAuth)

app.use('/private', require('./routes/private'));

app.use('/public', require('./routes/public'));

app.listen(port, (err) => {
    if (err) {
        console.log(err);
        return false;
    }
    console.log("sever is running on localhost:", port);
});
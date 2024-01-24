const express = require("express");

const port = 3001;

const bodyParser = require('body-parser');

var DB = require("./models/index");

DB.sequelize.sync({ alter: true }).then(() => {
    console.log("Table re-synced");
});

var usercontroller = require("./controllers/usercontrollers");

const User = require("./models/user");

const app = express();

app.use(express.urlencoded());


// app.get('/', function (req, res) {
//     res.send("hello world");
// })

app.post('/register', usercontroller.register);

app.post('/login', usercontroller.login);

app.post('/addUser', usercontroller.addUser);

app.get('/getUsers', usercontroller.getUsers);

app.get('/getUser/:id', usercontroller.getUser);

app.delete('/deletingUser/:id', usercontroller.deletingUser);

app.patch('/updateUser/:id', usercontroller.updateUser);

app.listen(port, (err) => {
    if (err) {
        console.log(err);
        return false;
    }
    console.log("sever is running on localhost:", port);
});

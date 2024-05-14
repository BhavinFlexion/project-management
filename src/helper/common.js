const fs = require('fs');

module.exports = {
    readHTMLFile: function (path, cb) {
        // read file
        fs.readFile(path, 'utf-8', function (err, data) {
            if (err) {
                console.log(err)
                throw err;
            } else {
                cb(null, data);
            }
        });
    },
}
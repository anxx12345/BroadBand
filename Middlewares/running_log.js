var fs = require("fs");

function LogIt(logFileName,logVariable){
    fs.appendFile(logFileName+'.txt', logVariable+'\r\n', function (err) {
        if (err) throw err;
    });
}
module.exports = LogIt;

let forever = require('forever-monitor');
process.stdin.resume();

let child = new(forever.Monitor)('app.js', {
    max: 9999,
    silent: false,
    minUptime: 2000,
    spinSleepTime: 5000
});

child.on('start', function() {
    console.log('Forever started for first time.');
});

child.on('exit', function() {
    console.error('Index.js file has exited after '+child.max+' restarts');
});

//Exit handler.
function exitHandler(options, err) {
    try{
        //Killing node process manually that is running "Index.js" file.
        process.kill(child.childData.pid);
        console.log("Child process killed succesfully!!");
        console.log("Forever exit!!");
    }
    catch(err){
        console.log("Child process already stopped!!");
        console.log("Forever exit!!");
    }

    //Killing forever process.
    process.exit();
}

//Handling user exit events like Ctrl+C.
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

child.start();
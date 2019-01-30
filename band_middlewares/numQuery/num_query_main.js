const child_process = require('child_process');
function run(num){
    return new Promise(function (resolve,reject) {
        let workerProcess;
        workerProcess = child_process.spawn('node', ['./band_middlewares/numQuery/child/Query.js', num]);

        workerProcess.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
            resolve(data.toString().replace(/\n$/,''));
        });
        workerProcess.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });
        workerProcess.on('close', function (code) {
            console.log('子进程已退出，退出码 '+code);
        });
    });
}
//暴露接口
// run(18605579675);

module.exports = run;
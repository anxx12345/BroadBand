const child_process = require('child_process');
function run(options){
    return new Promise(function (resolve,reject) {
        let workerProcess;
        // workerProcess = child_process.spawn('node', ['./child/qunzhang.js', options.host,options.vlan,options.manufacturer]);
        workerProcess = child_process.spawn('node', ['./band_middlewares/olt/child/qunzhang.js', options.host,options.vlan,options.manufacturer]);

        workerProcess.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
            resolve(data.toString());
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
// run({host:'10.10.28.2',vlan:'3242',manufacturer:'hw'});
//  run({host:'10.10.99.182',vlan:'3703',manufacturer:'zte'});

module.exports = run;
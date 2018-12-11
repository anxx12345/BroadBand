const child_process = require('child_process');
function run(options){
    return new Promise(function (resolve,reject) {
        let workerProcess;
        if(options.manufacturer === 'zte'){
             workerProcess = child_process.spawn('node', ['./band_middlewares/olt/child/zte_basic_query_child.js', options.host,options.loid]);
        }else if(options.manufacturer === 'hw'){
             workerProcess = child_process.spawn('node', ['./band_middlewares/olt/child/hw_basic_query_child.js', options.host,options.loid]);
        }
        // let workerProcess = child_process.spawn('node', ['zte_basic_query.js', options.host,options.loid]);

        workerProcess.stdout.on('data', function (data) {
            // console.log('stdout: ' + data);
            resolve(JSON.parse(data));
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
// run({host:'10.10.101.2',loid:'5570061226'});
module.exports = run;
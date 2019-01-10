let Telnet = require('telnet-client');
let connection = new Telnet();
const keys = require('../../../keys')
async function telnet(options){

    let params = {
        host: options.host,
        port: 23,
        loginPrompt : '>>User name:',
        passwordPrompt :'>>User password:',
        username: keys.olthw.username,
        password: keys.olthw.password,
        shellPrompt: '>',
        timeout: 20000, //1.5s
        execTimeout:20000,
        debug:true,
        removeEcho: 4
    };


    let res_arr = {  //telnet反馈结果
        gpon:'not find onu',     //获取的gpon onu参数
        res1:'', // 第一条指令结果
        res2:'', // 第二条指令结果....
        res3:'', // 第二条指令结果....
        res4:'', // 第二条指令结果....
        state:''
    };
    let gpon = '';

    let nomore_cmd =  ' enable \n config' //不暂停显示，因为需要显示接口信息，进入配置模式
    let gpon_cmd = 'display ont info by-loid ' + options.loid;

    await connection.connect(params);
    params.shellPrompt = ')#';  //下条命令改变提示符
    await connection.exec(nomore_cmd,params);

    res_arr.res1 = await connection.exec(gpon_cmd);
    // console.log(res_arr.result3)
    if(res_arr.res1.indexOf('does not exist') !== -1){
        console.log('The required ONT does not exist');
        connection.end();
        return res_arr
    }
    let catGponString = /F\/S\/P[\s\S]*:[\s\S]*ONT-ID[\s\S]*:[\s\S]*Control/.exec(res_arr.res1);
    let catGponList = catGponString[0].split(/\s+/)
    gpon = catGponList[2]
    let ont = catGponList[5]
    let gpons = gpon.split('/')
    let gpons1and2 = gpons[0]+'/'+gpons[1]
    let gpons3 = gpons[2]
    if(gpon){
        res_arr.gpon = gpon
        let othercmd = { //huawei获取信息的命令
            result0: 'display service-port port ' + gpon + ' ont ' + ont + '\n',
            result1: 'display ont autofind all',
            result2_1: 'interface gpon ' + gpons1and2 ,
            result2: 'display ont optical-info ' + gpons3 + ' ' + ont //power
        };
        res_arr.res2 = await connection.exec(othercmd.result0);
        res_arr.res4 = await connection.exec(othercmd.result1);
        await connection.exec(othercmd.result2_1);
        res_arr.res3 = await connection.exec(othercmd.result2);
        res_arr.state = true;

        res_arr.res1 = repalceSomething(res_arr.res1).replace(/VoIP configure method[\s\S]*/g,'');
        res_arr.res2 = repalceSomething(res_arr.res2).replace(/Total :[\s\S]*/g,'').replace(/\{ \<cr\>[\s\S]*List/g,'');
        res_arr.res3 = repalceSomething(res_arr.res3);
        res_arr.res4 = repalceSomething(res_arr.res4);
        let x = res_arr.res4.replace('   ------------------------------------------------------------------------\r\n','')
            .replace(/   ----+/g,'   -------------------------------------------------------');
        let y = x.split('\n');
        let arr = [];
        let i = 0;
        function res4_re(){
            let r = y[i];
            if(r.indexOf('F/S/P') !== -1||r.indexOf('Ont SN') !== -1 ||r.indexOf('Loid') !== -1||r.indexOf('----')!==-1 ||r.indexOf('ONT MAC')!==-1){
                //if(r.indexOf('Number')||r.indexOf('F/S/P')||r.indexOf('Ont SN') ||r.indexOf('Loid') !== -1){
                arr.push(r)
            }
            if( i < y.length-1 ){
                i++;
                res4_re();
            }else {
                //console.log(arr.join('\r\n'));
                res_arr.res4 = arr.join('\r\n');
            }
        }
        res4_re()

        console.log(JSON.stringify(res_arr));
        connection.end();
        // return res_arr;

    } else{
        res_arr.state = false;
        connection.end();
        console.log(res_arr);
        // return res_arr;
    }
}

function repalceSomething(str){
    let newStr = str.replace(`{ <cr>|e2e<K>|gemport<K>|sort-by<K> }:\r\n`,'')
        .replace('Command:\r\n','')
        .replace(/VoIP configure method[\s\S]*Switch-Oriented Flow List\r\n\s+-+\r\n/,'')
        .replace(/\u001b\[37D                                     \u001b\[37D/g,'')
        .replace('config\r\n','')
        .replace(/---- More \( Press 'Q' to break \) ----/g,'')
        .replace(/\( Press 'Q' to break \) ----  /g,'');
    return newStr
}

//暴露接口
// 10.10.75.2 5570049801 华为 055709959108

// telnet({host:'10.10.75.2',loid:'5570049801'});
//telnet({host:'10.10.28.2',loid:'5570070344'});
// telnet({host:'10.10.71.2',loid:'5570128650'})
let options = {host:process.argv[2],loid:process.argv[3]};
// module.exports = telnet;
telnet(options);

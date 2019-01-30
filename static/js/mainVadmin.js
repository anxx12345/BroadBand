$(function () {
    //取当天时间
    function getNowFormatDate() {
        var date = new Date();
        var seperator1 = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + seperator1 + month + seperator1 + strDate;
        return currentdate;
    }
    //整体页面路由器 默认是宽带界面,IPTV界面默认为none，后期vuejs精尽后再重构为vue或者使用angular
    let $band = $('#band');
    let $iptv = $('#iptv');
    $iptv.css('display','none');

    // 认证模块数据展现
    let vm_auth = new Vue({
        el:"#show_auth_list",
        data:{
            results:{
                userInfo:[],    // 用户在线信息
                userBandType:[], // 客户信息
                userAuthHis:[]  // 认证记录
            },
            show_auth_orNot:false // 是否显示 认证显示区
        },
        watch:{
            results: function () {
                this.$nextTick(function () {
                    var $userCountSta = $('#userCountSta');
                    $userCountSta.html(
                        $userCountSta.text()
                            .replace(/激活/,'<span class="label label-success">正常</span>')
                            .replace(/停机/,'<span class="label label-danger">停机</span>')
                    );
                });
            }
        }
    });
    let vm_olt = new Vue({
        el:'#show_olt_list',
        data:{
            results:{},
            show_olt_orNot:false,// 是否显示 OLT查询结果
            show_olt_tip:false,// 查询提示 loading ,认证部分是jquery实现的
            sysBusy:false,//显示系统是否繁忙
            woyunwei:false, // 显示结果或者没有结果的提示
            zteOrHwOlt:false // 显示结果或者没有结果的提示
        },
        watch:
            {
                results: function () {
                    this.$nextTick(function () {
                        if(this.results.manufacturer === 'zte'){//如果是中兴OLT
                            var $cat10cause = $('#cat10cause');
                            $cat10cause.html(
                                $cat10cause.text()
                                    .replace(/shutdown/i,'<span class=" label label-danger">系统闭锁</span>')
                                    .replace(/Phase state/g,'<span class="label label-primary">光猫当前状态</span>')
                                    .replace(/Authpass Time  /g,'<span class="label label-primary">光猫认证通过时间</span>')
                                    .replace(/Cause/i,'<span class=" label label-primary">原因</span></br>')
                                    .replace(/OfflineTime    /i,'<span class=" label label-primary">光猫历史掉线时间</span>')
                                    .replace(/OffLine/i,'<span class=" label label-danger">不在线</span></br>')
                                    .replace(/Serial number/g,'<span class=" label label-primary">光猫SN号</span>')
                                    .replace(/Online Duration/g,'<span class=" label label-primary">光猫在线时长</span>')
                                    .replace(/working/g,'<span class=" label label-success">工作正常</span>')
                                    .replace(/LOSi/g,'<span class=" label label-danger">光功率原因掉线</span>')
                                    .replace(/LOFi/g,'<span class=" label label-danger">光功率原因掉线</span>')
                                    .replace(/LOFI/g,'<span class=" label label-danger">光功率原因掉线</span>')
                                    .replace(/DyingGasp/g,'<span class=" label label-danger">断电掉线</span>')
                                    .replace(/Unkown/g,'<span class=" label label-danger">未知原因掉线</span>')
                                    .replace(/syncMib/g,'<span class=" label label-danger">同步中</span>')
                            );

                            var $catPower = $('#catPower');
                            $catPower.html(
                                $catPower.text()
                                    .replace(/OLT/g,'OLT收发光')
                                    .replace(/ONU/g,'光猫收发光  ')
                                    .replace(/Rx/g,'收光')
                                    .replace(/Tx/g,'发光')
                            );

                            var $catDataCheck = $('#catDataCheck');
                            var catData = $catDataCheck.text();
                            console.log(catData);
                            // var online1 = catData.match(/vlan\s10/g);
                            // var online1_lng = !online1 ? 0 : online1.length;
                            // var online2 = catData.match(/vlan\s10/g);
                            // var online2_lng = !online2 ? 0 : online2.length;
                            // var iptv1 = catData.match(/vlan\s282/g);
                            // var iptv1_lng = !iptv1 ? 0 : iptv1.length;
                            // var iptv2 = catData.match(/vlan\s282/g);
                            // var iptv2_lng = !iptv2 ? 0 : iptv2.length;
                            // console.log(online1_lng +' '+online2_lng+' '+iptv1_lng+' '+iptv2_lng);
                            let muticat = catData.match(/vlan\s10/g)
                            let muticat_lng = !muticat?0:muticat.length;
                            let iptv = catData.match(/vlan\s282/g);
                            let iptv_lng = !iptv?0:iptv.length;
                            let $onlineCheckResult = $("#onlineCheckResult");
                            let $iptvCheckResult = $("#iptvCheckResult");

                            let $singleCatZte = $("#singleCatZte");
                            let $doubleCatZte = $("#doubleCatZte");
                            let $iptvZte = $('#iptvZte')
                            let $autoComZte = $('#autoComZte');
                            let autoCom = false;
                            //判断是单口光猫
                            if(catData.indexOf('eth') !==-1){
                                $singleCatZte.html('<span class="label label-success">单口猫上网数据正常</span>')
                                //判断是多口光猫
                                if(muticat_lng >= 5 ){
                                    $doubleCatZte.html('<span class="label label-success">多口猫上网数据正常</span>')
                                }else {
                                    $doubleCatZte.html('<span class="label label-danger">多口猫上网数据缺失</span>')
                                    autoCom = true;
                                }
                            }else {
                                $singleCatZte.html('<span class="label label-danger">单口猫上网数据缺失</span>')
                                autoCom = true;
                                //判断是多口光猫
                                if(muticat_lng >= 4 ){
                                    $doubleCatZte.html('<span class="label label-success">多口猫上网数据正常</span>')
                                }else {
                                    $doubleCatZte.html('<span class="label label-danger">多口猫上网数据缺失</span>')
                                    autoCom = true;
                                }
                            }

                            if(iptv_lng >= 4){
                                $iptvZte.html('<span class="label label-success">IPTV数据正常</span>')
                            }else {
                                $iptvZte.html('<span class="label label-danger">IPTV数据缺失</span>')
                                autoCom = true;
                            }
                            if(autoCom){
                                $autoComZte.html('<button class="small btn btn-primary" id="autoComClick">点击一键添加数据</button>')
                            }

                        }else if(this.results.manufacturer === 'hw'){//如果是华为OLT
                            var $catCause = $('#catCause');
                            $catCause.html(
                                $catCause.text()
                                    .replace(/Run state    /g,'<span class="label label-primary">光猫当前状态</span>')
                                    .replace(/SN   /g,'<span class="label label-primary">光猫SN号</span>')
                                    .replace(/online/i,'<span class=" label label-success">工作正常</span></br>')
                                    .replace(/offline/i,'<span class=" label label-danger">不在线</span></br>')
                                    .replace(/deactivated/i,'<span class=" label label-danger">系统闭锁</span>')
                                    // .replace(/failed/i,'<span class=" label label-danger">状态异常</span>')
                                    .replace(/Last down cause  /g,'<span class=" label label-primary">最后一次掉线原因</span>')
                                    .replace(/ONT online duration /g,'<span class=" label label-primary">光猫在线时长             </span>')
                                    .replace(/LOSi?/g,'<span class=" label label-danger">光功率原因掉线</span>')
                                    .replace(/LOFi/g,'<span class=" label label-danger">光弱原因掉线</span>')
                                    .replace(/SFi/g,'<span class=" label label-danger">光功率原因掉线</span>')
                                    .replace(/dying-gasp/g,'<span class=" label label-danger">断电掉线</span>')
                                    .replace(/Unkown/g,'<span class=" label label-danger">未知原因掉线</span>')
                            );

                            var $catPowerHw = $('#catPowerHw');
                            $catPowerHw.html(
                                $catPowerHw.text()
                                    .replace(/Rx optical power/i,'<span class="label label-primary">光猫收光         </span>')
                                    .replace(/Failure: The ONT is not online/i,'</br><span class="label label-danger">光猫不在线</span>')
                            );
                            var $huaweiAuthCat = $("#huaweiAuthCat");//华为OLT光猫在线情况.
                            $huaweiAuthCat.html(
                                $huaweiAuthCat.text()
                                    .replace(/Failure: The automatically found ONTs do not exist/i,'<br><span class="label label-danger">无未成功注册光猫</span> ')
                            );
                            var $catDataCheckHw = $('#catDataCheckHw');
                            var catDataHw = $catDataCheckHw.text();
                            //console.log(catData);
                            var singleCat = catDataHw.indexOf('untag');
                            var doubleCate = catDataHw.indexOf('vlan  10');
                            var iptvHw = catDataHw.indexOf('282');
                            let $singleCatHw = $("#singleCatHw");
                            let $doubleCatHw = $("#doubleCatHw");
                            let $iptvHw = $('#iptvHw');
                            let $autoComHw = $('#autoComHw');
                            let autoCom = false;
                            if(singleCat !== -1){
                                $singleCatHw.html('<span class="label label-success">单口猫上网数据正常</span>')
                            }else {
                                $singleCatHw.html('<span class="label label-danger">单口猫上网数据缺失</span>')
                                autoCom = true;
                            }
                            if( doubleCate !== -1){
                                $doubleCatHw.html('<span class="label label-success">多口猫上网数据正常</span>')
                            }else {
                                $doubleCatHw.html('<span class="label label-danger">多口猫上网数据缺失</span>')
                                autoCom = true;
                            }
                            if(iptvHw !== -1){
                                $iptvHw.html('<span class="label label-success">IPTV数据正常</span>')
                            }else {
                                $iptvHw.html('<span class="label label-danger">IPTV数据缺失</span>')
                                autoCom = true;
                            }
                            if(autoCom){
                                $autoComHw.html('<button class="small btn btn-primary" id="autoComClick">点击一键添加数据</button>')
                            }
                        }
                    });
                }
            }
    });
    let vm_iptv = new Vue({
        el:'#iptvShowArea',
        data:{
            results:{
                userIPTVnum:'',
                userIPTVmac:''
            },
            show_iptv_orNot:false,//是否显示iptv数据区域
            numCheck:false, //号码是否正确
            type:true, //true means check iptv num,false means unbind iptv
            show_result:'good'
        }
    });
    let $show_area_tip = $('#show_area_tip');
    let $start_time = $('#timePicker_start');
    let $end_time = $('#timePicker_end');
    let today = getNowFormatDate();
    $start_time.val(today);
    $end_time.val(today);
    //用户认证模块
    $(document).on('click','#queryAuthBtn', function (e) {
        $queryAuthBtn = $('#queryAuthBtn');
        $queryAuthBtn.attr('disabled',true).html('<b style="color: #ff0000">认证信息查询十秒锁定</b>');
        setTimeout(function () {
            $queryAuthBtn.attr('disabled',false).html('<b>查询用户认证信息</b>')
        },10000);
        vm_auth.show_auth_orNot = false;//是否显示认证结果区域vue if模块判断参数
        vm_auth.results = {userInfo:[],userAuthHis:[]};
        e.preventDefault();
        let userNum = $('#input_usernum').val();
        let cellNum = $('#input_cellnum').val();
        let start_time = $start_time.val();
        let end_time = $end_time.val();
        if(start_time === '' || end_time === '' || start_time > end_time){
            $show_area_tip.text('请输入正确的开始和结束时间');
        }else {
            //认证系统post数据模块，后台相应后进行爬取并返回
            if(userNum.match(/05570\d{7}/)&&userNum.toString().length === 12 || cellNum.match(/1\d{10}/)&&cellNum.toString().length===11){
                $show_area_tip.html("<p class='tips'>正在查询认证系统信息<img src='static/images/wait.gif' /></p>");
                //auth post block
                $.post('/auth',{
                    userNum:userNum === '' ? cellNum : userNum,
                    startTime:start_time+" 00:00:00",
                    endTime: end_time+" 23:59:59"
                }, function (result) {

                    if(JSON.stringify(result.userInfo) === '{}'&&JSON.stringify(result.userAuthHis) === '{}'){
                        $show_area_tip.text('此宽带帐号无记录。')
                    }else if(JSON.stringify(result) === '{}'){
                        $show_area_tip.text('此宽带帐号无记录。')
                    }else if(result.toString().indexOf('no num') !== -1){
                        $show_area_tip.text('此手机号无对应的宽带账号信息，请输入用户入网时正确的联系号码.或者直接输入宽带号码查询.')
                    }else {
                        if (result.bandNum) {
                            $show_area_tip.text(`用户宽带号码: ${result.bandNum}`);
                        }else{
                            $show_area_tip.text('查询结果如下:');
                        }
                        vm_auth.show_auth_orNot = true;
                        vm_auth.results = result;
                    }
                });
            }else {
                $show_area_tip.text('请输入正确的宽带帐号或者手机号码！')
            }
        }
    });
    //OLT查询模块内部 表格提交
    $(document).on('click','#queryOltBtn', function (e) {
        $show_area_tip.html("<p class='tips'>正在计算<img src='static/images/wait.gif' /></p>");
        $queryOltBtn = $('#queryOltBtn');
        $queryOltBtn.attr('disabled',true).html('<b style="color: #ff0000">OLT查询十秒锁定</b>');
        setTimeout(function () {
            $queryOltBtn.attr('disabled',false).html('<b>查询用户OLT信息</b>')
        },10000);
        vm_olt.show_olt_orNot = false;//是否显示olt区域vue if模块判断参数
        vm_olt.sysBusy = false;//是否显示olt后台忙vue if模块判断参数
        e.preventDefault();
        let userNum = $('#input_usernum').val();
        let cellNum = $('#input_cellnum').val();
        let start_time = $start_time.val();
        let end_time = $end_time.val();
        if(start_time === '' || end_time === '' || start_time > end_time){
            $show_area_tip.text('请输入正确的开始和结束时间');
        }else {
            //认证系统post数据模块，后台相应后进行爬取并返回
            if(userNum.match(/05570\d{7}/)&&userNum.toString().length === 12 || cellNum.match(/1\d{10}/)&&cellNum.toString().length===11){
                //华为或中兴olt post数据模块，判断沃运维app数据，olt爬取数据
                vm_olt.woyunwei = false;
                vm_olt.zteolt = false;
                vm_olt.show_olt_tip = true;
                $.post('/olt_v3',{
                    userNum:userNum ? userNum : cellNum
                }, function (result) {
                    console.log(result);
                    $show_area_tip.html("查询结果如下:");
                    //console.log(result);//post返回结果
                    vm_olt.show_olt_tip = false; //动画提示隐藏
                    vm_olt.woyunwei = false; //清空上次OLT查询页面提示
                    vm_olt.zteOrHwOlt = false;//清空上次OLT查询页面提示
                    vm_olt.sysBusy = false;//清空上次OLT查询页面提示

                    if (result.toString().indexOf('woyunwei') !== -1) {//判断wo运维app是否没有信息
                        vm_olt.show_olt_orNot = true;//显示olt区域
                        vm_olt.woyunwei = true;
                    } else if (result.toString().indexOf('只支持FTTH区域') !== -1) {//wo运维中判断是不是FTTH区域
                        vm_olt.show_olt_orNot = true;//显示olt区域
                        vm_olt.zteOrHwOlt = true;
                    } else if (result.toString() === 'sysBusy') {//判断OLT后台是否忙
                        vm_olt.show_olt_orNot = true;//显示olt区域
                        vm_olt.sysBusy = true;
                    } else if (result.toString().indexOf('no num') !== -1) {
                        vm_olt.show_auth_orNot = false;//不显示olt区域
                        $show_area_tip.text('此手机号无对应的宽带账号信息，请输入用户入网时正确的联系号码.或者直接输入宽带号码查询.')
                    } else {//以上都未发生则正常把结果赋值给 vm模型
                        vm_olt.show_olt_orNot = true;//显示olt区域
                        vm_olt.results = result;
                    }
                })
            }else {
                $show_area_tip.text('请输入正确的宽带帐号或者手机号码！')
            }
        }
    });
    //页面整体路由切换 区分目前为iptv和宽带模块
    let $toggleBtn = $('.navbar-header button');
    $(document).on('click','#bandRouteClick', function (e) {
        e.preventDefault();
        $iptv.fadeOut('normal',function () {
            $band.fadeIn('fast');
        });
        $toggleBtn.click();
    });
    $(document).on('click','#iptvRouteClick', function (e) {
        e.preventDefault();
        $band.fadeOut('normal',function () {
            $iptv.fadeIn('fast');
        });
        $toggleBtn.click();
    });
    //IPTV模块
    $(document).on('click','#queryIptvBtn', function (e) {
        e.preventDefault();
        $show_iptv_loading = $("#show_iptv_loading");
        vm_iptv.show_iptv_orNot = false;
        vm_iptv.numCheck = true;
        vm_iptv.type = true;
        let code = $('#codeText').val();
        let num =$('#num').val();

        vm_iptv.results = {
            iptvNum:'',
            iptvMac:'',
            active:'',
            state:''
        };
        if(num.match(/05570\d{7}/)&&num.toString().length === 12){
            $show_iptv_loading.html("<p class='tips'>正在查询<img src='static/images/wait.gif' /></p>");
            vm_iptv.numCheck = false;
            $.post('/iptvQuery',{
                num:num,
                code:code
            }, function (result) {
                vm_iptv.show_iptv_orNot = true;
                vm_iptv.results = result;
                $show_iptv_loading.html('');

            })
        }else{
            vm_iptv.show_iptv_orNot = true;
            vm_iptv.numCheck =true;
        }

        setTimeout(function () {
            $.get('/iptvCode',{}, function () {
                $('#codeImg').attr('src','/iptvCode');
            });
        },1000)

    });

    $(document).on('click','#unbindBtn', function (e) {
        e.preventDefault();
        vm_iptv.show_iptv_orNot = false;
        vm_iptv.numCheck = true;
        vm_iptv.type = false;
        $show_iptv_loading = $("#show_iptv_loading");

        let code = $('#codeText').val();
        let mac =$('#mac').val();



        if(mac.indexOf(':') !== -1 && mac.toString().length === 17) {
            $show_iptv_loading.html("<p class='tips'>正在查询<img src='static/images/wait.gif' /></p>");
            vm_iptv.numCheck = false;
            $.post(
                '/iptvUnbind', {
                    code: code,
                    mac: mac
                }, function (result) {
                    vm_iptv.show_iptv_orNot = true;
                    vm_iptv.results = result;
                    console.log(JSON.stringify(result));
                    if(vm_iptv.results.state.indexOf('成功') !== -1){
                        vm_iptv.show_result = 'good'
                    }else{
                        vm_iptv.show_result = 'bad'
                    }
                    console.log(vm_iptv.show_result);
                    $show_iptv_loading.html('');
                }
            );
        }else{
            vm_iptv.show_iptv_orNot = true;
            vm_iptv.numCheck =true;
        }
        setTimeout(function () {
            $.get('/iptvCode',{}, function () {
                $('#codeImg').attr('src','/iptvCode');
            });
        },1000)
    });

    $(document).on('click','#activeBtn', function (e) {
        e.preventDefault();
        vm_iptv.show_iptv_orNot = false;
        vm_iptv.numCheck = true;
        vm_iptv.type = false;
        $show_iptv_loading = $("#show_iptv_loading");

        let code = $('#codeText').val();
        let mac =$('#mac_iptv').val();



        if(mac.indexOf(':') !== -1 && mac.toString().length === 17) {
            $show_iptv_loading.html("<p class='tips'>正在查询<img src='static/images/wait.gif' /></p>");
            vm_iptv.numCheck = false;
            console.log(1)
            $.post(
                '/iptvAct', {
                    code: code,
                    mac: mac
                }, function (result) {
                    vm_iptv.show_iptv_orNot = true;
                    vm_iptv.results = result;
                    console.log(JSON.stringify(result));
                    if(vm_iptv.results.state.indexOf('成功') !== -1){
                        vm_iptv.show_result = 'good'
                    }else{
                        vm_iptv.show_result = 'bad'
                    }
                    console.log(vm_iptv.show_result);
                    $show_iptv_loading.html('');
                }
            );
        }else{
            vm_iptv.show_iptv_orNot = true;
            vm_iptv.numCheck =true;
        }
        setTimeout(function () {
            $.get('/iptvCode',{}, function () {
                $('#codeImg').attr('src','/iptvCode');
            });
        },1000)
    });

    $(document).on('click','#codeImg', function () {
        $.get('/iptvCode',{}, function () {
            $('#codeImg').attr('src','/iptvCode');
        })
    })

    $(document).on('click','#queryQzBtn',function (e) {
        $('#queryOltBtn').click();
        let $qunzhangArea = $('#qunzhangArea');
        e.preventDefault();
        let userNum = $('#input_usernum').val();
        let cellNum = $('#input_cellnum').val();
        if(userNum.match(/05570\d{7}/)&&userNum.toString().length === 12 || cellNum.match(/1\d{10}/)&&cellNum.toString().length===11){
            $qunzhangArea.html("<p class='tips' style='font-size: 2em;'>正在查询群障信息<img src='static/images/wait.gif'/></p>");
            //华为或中兴olt post数据模块，判断沃运维app数据，olt爬取数据
            $.post('/oltAdmin',{
                userNum:userNum ? userNum : cellNum
            }, function (result) {
                console.log(result.manufacturer);
                    if (result.toString() === 'no num') {
                        $qunzhangArea.html(`<span class="label label-warning">该手机号码没有对应的宽带信息</span>`)
                    } else {
                        if (result.qz_state.indexOf('无群障') !== -1) {
                            $qunzhangArea.html(`<span class="label label-success">${result.qz_state}(${result.manufacturer}OLT IP:${result.olt_ip})</span>`)
                        } else {
                            // alert(result.qz_state.indexOf('上行链路') !==-1 && result.manufacturer === 'zte')
                            if (result.qz_state.indexOf('上行链路') !==-1&& result.manufacturer === 'zte') {
                                $qunzhangArea.html(`<span class="label label-danger">${result.qz_state}(${result.manufacturer}OLT IP:${result.olt_ip})</span>
                                <br>
                                <a class = 'btn btn-small btn-warning' id = 'errHandOverBtn'>一键倒换(目前支持中兴OLT，华为OLT请勿点击)</a>
                                `)
                            } else {
                                $qunzhangArea.html(`<span class="label label-danger">${result.qz_state}(${result.manufacturer}OLT IP:${result.olt_ip})</span>`)
                            }
                        }
                    }

                })
        } else {
            $show_area_tip.text('请输入正确的宽带帐号或者手机号码！')
        }
    });

    $(document).on('click','#autoComClick',function (e) {
        let $autoComClick = $('#autoComClick');
        $autoComClick.attr('disabled',true).html('<b style="color: snow">请重新查询用户OLT信息</b>');
        let userNum = $('#input_usernum').val();
        let onuid;
        if(vm_olt.results.manufacturer === 'hw'){
           onuid = vm_olt.results.res1.split('\n')[2].split(':')[1].trim();
        }else {
           onuid = vm_olt.results.gpon.split(':')[1];
        }
        console.log('onuid'+onuid);
        $.post('/olt_autoCom',{
            userNum:userNum,
            onuid:onuid
        }, function (result) {
            console.log(result);
        })
    })
    $(document).on('click','#errHandOverBtn',function(e){
        let userNum = $('#input_usernum').val();
        if (userNum.match(/05570\d{7}/) && userNum.toString().length === 12) {
          $.post('/olt_errHandOver',{
              userNum:userNum
          },function(res){
              console.log(res)
              alert(res.result)
          }) 
        } else {
            $show_area_tip.text('请输入正确的宽带帐号或者手机号码！')
        }
    })
    $(document).on('focus','#input_usernum',function(e){
        $('#input_cellnum').val('')
    })
    $(document).on('focus','#input_cellnum',function(e){
        $('#input_usernum').val('')
    })

});
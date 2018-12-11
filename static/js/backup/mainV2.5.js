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
                                .replace(/Phase state/g,'<span class="label label-primary">光猫当前状态</span>')
                                .replace(/Serial number/g,'<span class=" label label-primary">光猫SN号</span>')
                                .replace(/Online Duration/g,'<span class=" label label-primary">光猫在线时长</span>')
                                .replace(/working/g,'<span class=" label label-success">工作正常</span>')
                                .replace(/LOSi?/g,'<span class=" label label-danger">光功率原因掉线</span>')
                                .replace(/LOFI/g,'<span class=" label label-danger">光功率原因掉线</span>')
                                .replace(/DyingGasp/g,'<span class=" label label-danger">断电掉线</span>')
                                .replace(/Unkown/g,'<span class=" label label-danger">未知原因掉线</span>')
                        );

                        var $catPower = $('#catPower');
                        $catPower.html(
                            $catPower.text()
                                .replace(/up/g,'OLT 收发光')
                                .replace(/OLT/,'              OLT')
                                .replace(/down/g,'光猫收发光  ')
                                .replace(/Rx/g,'收光')
                                .replace(/Tx/g,'发光')
                        );

                        var $catDataCheck = $('#catDataCheck');
                        var catData = $catDataCheck.text();
                        //console.log(catData);
                        var online1 = catData.match(/vlan\s10/g);
                        var online1_lng = !online1 ? 0 : online1.length;
                        var online2 = catData.match(/vid\s10/g);
                        var online2_lng = !online2 ? 0 : online2.length;
                        var iptv1 = catData.match(/vlan\s282/g);
                        var iptv1_lng = !iptv1 ? 0 : iptv1.length;
                        var iptv2 = catData.match(/vid\s282/g);
                        var iptv2_lng = !iptv2 ? 0 : iptv2.length;
                        console.log(online1_lng +' '+online2_lng+' '+iptv1_lng+' '+iptv2_lng);
                        $onlineCheckResult = $("#onlineCheckResult");
                        $iptvCheckResult = $("#iptvCheckResult");
                        if(catData.indexOf('transparent') ===-1){//判断是单口光猫
                            console.log('dan kou');
                            $iptvCheckResult.html('<span class="label label-primary">单口猫无IPTV数据</span>')
                              if(online1_lng === 4){
                                  $onlineCheckResult.html('<span class="label label-success">上网数据正常</span>')
                              }else {
                                  $onlineCheckResult.html('<span class="label label-danger">上网数据缺失</span>')
                              }
                        }else {//判断是多口光猫
                            if(online1_lng === 4 && online2_lng === 1 ){
                                $onlineCheckResult.html('<span class="label label-success">上网数据正常</span>')
                            }else {
                                $onlineCheckResult.html('<span class="label label-danger">上网数据缺失</span>')
                            }
                            if(iptv1_lng === 3 && iptv2_lng ===1 ){
                                $iptvCheckResult.html('<span class="label label-success">IPTV数据正常</span>')
                            }else {
                                $iptvCheckResult.html('<span class="label label-danger">IPTV数据缺失</span>')

                            }
                        }

                    }else if(this.results.manufacturer === 'huawei'){//如果是华为OLT
                        var $catCause = $('#catCause');
                        $catCause.html(
                            $catCause.text()
                                .replace(/Run state    /g,'<span class="label label-primary">光猫当前状态</span>')
                                .replace(/SN   /g,'<span class="label label-primary">光猫SN号</span>')
                                .replace(/online\r\n/i,'<span class=" label label-success">工作正常</span></br>')
                                .replace(/offline\r\n/i,'<span class=" label label-danger">不在线</span></br>')
                                .replace(/failed/i,'<span class=" label label-danger">状态异常</span>')
                                .replace(/Last down cause  /g,'<span class=" label label-primary">最后一次掉线原因</span>')
                                .replace(/ONT online duration /g,'<span class=" label label-primary">光猫在线时长             </span>')
                                .replace(/LOSi?/g,'<span class=" label label-danger">光功率原因掉线</span>')
                                .replace(/LOFi/g,'<span class=" label label-danger">光功率原因掉线</span>')
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
                        $singleCatHw = $("#singleCatHw");
                        $doubleCatHw = $("#doubleCatHw");
                        $iptvHw = $('#iptvHw');
                        if(singleCat !== -1){
                            $singleCatHw.html('<span class="label label-success">单口猫上网数据正常</span>')
                        }else {
                            $singleCatHw.html('<span class="label label-danger">单口猫上网数据缺失</span>')
                        }
                        if( doubleCate !== -1){
                            $doubleCatHw.html('<span class="label label-success">多口猫上网数据正常</span>')
                        }else {
                            $doubleCatHw.html('<span class="label label-danger">多口猫上网数据缺失</span>')
                        }
                        if(iptvHw !== -1){
                            $iptvHw.html('<span class="label label-success">IPTV数据正常</span>')
                        }else {
                            $iptvHw.html('<span class="label label-danger">IPTV数据缺失</span>')
                        }

                    }
                });
            }
        }
    });

    let $show_area_tip = $('#show_area_tip');
    let $start_time = $('#timePicker_start');
    let $end_time = $('#timePicker_end');
    let today = getNowFormatDate();
    $start_time.val(today);
    $end_time.val(today);
    //宽带模块内部 表格提交
    $(document).on('click','#queryBtn', function (e) {
        vm_auth.show_auth_orNot = false;//是否显示认证结果区域vue if模块判断参数
        vm_olt.show_olt_orNot = false;//是否显示olt区域vue if模块判断参数
        vm_olt.sysBusy = false;//是否显示olt后台忙vue if模块判断参数
        vm_auth.results = {userInfo:[],userAuthHis:[]};
        e.preventDefault();
        let userNum = $('#input_usernum').val();
        let start_time = $start_time.val();
        let end_time = $end_time.val();
        if(start_time === '' || end_time === '' || start_time > end_time){
            $show_area_tip.text('请输入正确的开始和结束时间');
        }else {
            //认证系统post数据模块，后台相应后进行爬取并返回
            if(userNum.match(/05570\d{7}/)&&userNum.toString().length === 12){
                $show_area_tip.html("<p class='tips'>正在查询认证系统信息<img src='static/images/wait.gif' /></p>");
                //auth post block
                $.post('/auth',{
                    userNum:userNum,
                    startTime:start_time+" 00:00:00",
                    endTime: end_time+" 23:59:59"
                }, function (result) {

                    if(JSON.stringify(result.userInfo) === '{}'&&JSON.stringify(result.userAuthHis) === '{}'){
                        $show_area_tip.text('此宽带帐号无记录。')
                    }else if(JSON.stringify(result) === '{}'){
                        $show_area_tip.text('此宽带帐号无记录。')
                    } else {
                        $show_area_tip.text('查询结果如下:');
                        vm_auth.show_auth_orNot = true;
                        vm_auth.results = result;

                    }
                });



                //华为或中兴olt post数据模块，判断沃运维app数据，olt爬取数据
                vm_olt.woyunwei = false;
                vm_olt.zteolt = false;
                vm_olt.show_olt_tip = true;
                $.post('/olt_V3',{
                    userNum:userNum
                }, function (result) {
                    console.log(result);
                    //console.log(result);//post返回结果
                    vm_olt.show_olt_tip = false; //动画提示隐藏
                    vm_olt.show_olt_orNot = true;//显示olt区域
                    vm_olt.woyunwei = false; //清空上次OLT查询页面提示
                    vm_olt.zteOrHwOlt = false;//清空上次OLT查询页面提示
                    vm_olt.sysBusy = false;//清空上次OLT查询页面提示


                    if(result.toString().indexOf('woyunwei') !== -1){//判断wo运维app是否没有信息
                        vm_olt.woyunwei = true;
                    }else if(result.toString().indexOf('只支持FTTH区域') !== -1){//wo运维中判断是不是FTTH区域
                        vm_olt.zteOrHwOlt = true;
                    }else if(result.toString() === 'sysBusy') {//判断OLT后台是否忙
                        vm_olt.sysBusy = true;
                    }else {//以上都未发生则正常把结果赋值给 vm模型
                        vm_olt.results = result;
                    }


                })
            }else {
                $show_area_tip.text('请输入正确的宽带帐号！')
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


});
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
    let vm_auth = new Vue({
        el:"#show_auth_list",
        data:{
            results:{
                userInfo:[],
                userBandType:[],
                userAuthHis:[]
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
            zteolt:false // 显示结果或者没有结果的提示
        },
        watch:
        {
            results: function () {
                this.$nextTick(function () {
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
                });
            }
        }
    });
    $show_area_tip = $('#show_area_tip');
    $start_time = $('#timePicker_start');
    $end_time = $('#timePicker_end');
    let today = getNowFormatDate();
    $start_time.val(today);
    $end_time.val(today);
    //$(document).ajaxStart(function(){});
    $(document).on('click','#queryBtn', function (e) {
        vm_auth.show_auth_orNot = false;
        vm_olt.show_olt_orNot = false;
        vm_olt.sysBusy = false;
        vm_auth.results = {userInfo:[],userAuthHis:[]};
        e.preventDefault();
        let userNum = $('#input_usernum').val();
        let start_time = $start_time.val();
        let end_time = $end_time.val();
        if(start_time === '' || end_time === '' || start_time > end_time){
            $show_area_tip.text('请输入正确的开始和结束时间');
        }else {
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
                //olt post block
                vm_olt.woyunwei = false;
                vm_olt.zteolt = false;
                vm_olt.show_olt_tip = true;
                $.post('/olt',{
                    userNum:userNum
                }, function (result) {
                    console.log(result);
                    vm_olt.show_olt_tip = false;
                    vm_olt.show_olt_orNot = true;
                    if(result.toString().indexOf('woyunwei') !== -1){
                        vm_olt.woyunwei = true;
                    }else if(result.toString().indexOf('zte olt user') !== -1){
                        vm_olt.zteolt = true;
                    }
                    if(result.toString().indexOf('sysBusy')!==-1){
                        vm_olt.sysBusy = true;
                    }else{
                        vm_olt.results = result;
                    }
                })
            }else {
                $show_area_tip.text('请输入正确的宽带帐号！')
            }
        }
    });
});
$(function () {
    let vm = new Vue({
        el:"#show_list",
        data:{
            results:{
                userInfo:[],
                userAuthHis:[]
            },
            showOrNot:false
        }
    });
    $show_area = $('#show_area');
    $(document).ajaxStart(function(){
        $show_area.html("<p>正在查询...... <img src='static/images/demo_wait.gif' /></p>");
    });
    $(document).on('click','#queryBtn', function (e) {
        vm.showOrNot = false;
        vm.results = {userInfo:[],userAuthHis:[]};
        e.preventDefault();
        let userNum = $('#input_usernum').val();
        start_time = $('#timePicker_start').val();
        end_time = $('#timePicker_end').val();
        if(start_time === '' || end_time === '' || start_time > end_time){
            $show_area.text('请输入正确的开始和结束时间');
        }else {
            if(userNum.match(/05570\d{7}/)&&userNum.toString().length === 12){
                $.post('/auth',{
                    userNum:userNum,
                    startTime:start_time+" 00:00:00",
                    endTime: end_time+" 23:59:59"
                }, function (result) {
                    if(JSON.stringify(result.userInfo) === '{}'&&JSON.stringify(result.userAuthHis) === '{}'){
                        $show_area.text('此宽带帐号无记录。')
                    }else if(JSON.stringify(result) === '{}'){
                        $show_area.text('此宽带帐号无记录。')
                    } else {
                        $show_area.text('查询结果如下:');
                        vm.showOrNot = true;
                        vm.results = result;
                    }
                })
            }else {
                $show_area.text('请输入正确的宽带帐号！')
            }
        }
    });
});
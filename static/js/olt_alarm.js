$(function () {
    let vm_olt_alarm = new Vue({
        el:"#app",
        data:{
            results:{
                name:'',    //
                start_time:'', //
                end_time:''  //
            },
            tips_time:false, // 是否显示 input time error.
            show_alarm_orNot:false

        },
        // watch:{
        //     results: function () {
        //         this.$nextTick(function () {
        //             var $userCountSta = $('#userCountSta');
        //             $userCountSta.html(
        //                 $userCountSta.text()
        //                     .replace(/激活/,'<span class="label label-success">正常</span>')
        //                     .replace(/停机/,'<span class="label label-danger">停机</span>')
        //             );
        //         });
        //     }
        // }
    });


    $(document).on('click','#viewBtn',function (e) {
        let start_time = $('#timePicker_start').val();
        let end_time = $('#timePicker_end').val();
        e.preventDefault();
        if(start_time === '' || end_time === '' || start_time > end_time){
            vm_olt_alarm.tips_time = true;
            vm_olt_alarm.show_alarm_orNot = false;
        }else {
            vm_olt_alarm.tips_time = false;
            vm_olt_alarm.show_alarm_orNot = true;
            $.post('/olt_alarm',{
                start_time:start_time+" 00:00:00",
                end_time:end_time+" 23:59:59"
            },function (results) {
                vm_olt_alarm.results = results;
            })
        }
    })
});

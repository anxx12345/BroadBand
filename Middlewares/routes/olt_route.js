let Sequ_Module = require('../../mysql/Modules/Sequ_Module');
module.exports = (router)=>{
    router.post('/olt_alarm',async (ctx,next)=>{
        let start_time = ctx.request.body.start_time;
        let end_time = ctx.request.body.end_time;
        if(!ctx.session.user){
            await ctx.redirect('/')
        }else {
            let results = await Sequ_Module.MOD.findAll({
                where:{
                    start_time:{
                        '$gte':start_time
                    },
                    '$or':[
                        { end_time: {
                                'lte': end_time
                            }
                        },
                        {end_time:null}
                    ]
                }
            });
            let res_arr = [];
            for(let res of results){
                res_arr.push(res.dataValues);
            }
            ctx.response.body = res_arr;
        }

    })
};
// (async ()=>{
//     start_time = '2018-09-14';
//     end_time = '2018-09-20';
//     let results = await Sequ_Module.MOD.findAll({
//         where:{
//             start_time:{
//                 '$gte':start_time
//             },
//             '$or':[
//                 { end_time: {
//                         'lte': end_time
//                     }{
//                 },{
//                 {end_time:null{}
//             ]{
//         }
//     });
//     let res_arr = [];
//     for(let res of results){
//         res_arr.push(res.dataValues);
//     }
//     console.log(res_arr)
// })();

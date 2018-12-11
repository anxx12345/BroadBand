const router = require('koa-router')();
let router_main = require('../Middlewares/routes/iptv_route');
let router_iptv= require('./routes/auth&olt_route');
let router_olt_alarm = require('./routes/olt_route');
const logIt = require('./running_log');
const keys = require('../keys');
module.exports = ()=>{
    router_main(router);
    router_iptv(router);
    router_olt_alarm(router);
    router.get('/',async (ctx,next)=> {
        let rflash = ctx.flash('info');
        //console.log(rflash[0]);
        await ctx.render('index',{
            message: rflash
        });
    });
    //define home page
    router.get('/home',async (ctx,next)=>{
        //这里做校验，不存在则跳转到登录页面
        if (!ctx.session.user) {
            await ctx.response.redirect('/');
        }else {
            let homepage = '';
            user = ctx.session.user;
            if(ctx.session.user === keys.auth.guest.username){
                homepage = 'indexV4.5';
            }
            if(ctx.session.user === keys.auth.admin.username){
                homepage = 'indexVadmin';
            }
            await ctx.render(homepage, {
                title: user
            });
        }

    });
    router.get('/olt_alarm',async (ctx,next)=>{
        //这里做校验，不存在则跳转到登录页面
        if (ctx.session.user !== keys.auth.admin.username) {
            await ctx.response.redirect('/');
        }else {
            await ctx.render('olt_alarm', {
                title: ctx.session.user
            });
        }

    });
    router.post('/login',async(ctx,next)=>{
        let username= ctx.request.body.username;
        let password = ctx.request.body.password;
        logIt(__dirname+'/login info','visit_time '+new Date().format("yyyy-MM-dd hh:mm:ss")+ ' username:' +username + ' password:'+ password+' 远程IP地址:'+ ctx.request.ip);
        console.log(ctx.request.body);
        console.log(keys.auth)
        let userPasUser  = username === keys.auth.guest.username && password === keys.auth.guest.password;
        let userPasAdmin = username === keys.auth.admin.username && password === keys.auth.admin.password;
        if (userPasUser || userPasAdmin) {
            //保存登录状态
            //console.log('post res ' + ctx.response.status);
            ctx.response.status = 200;
            ctx.session.user = username;
            console.log('login success. ' + username);
            await ctx.redirect('/home')
            //ctx.body = { success: true, msg: '登录成功！' };
        }
        else{
            console.log('login failure');
            ctx.flash('info','用户名或者密码错误，登陆失败!');
            await ctx.redirect('/');
            // ctx.body = { success: false, msg: '账号或密码错误！' };
        }
    });
    router.post('/query',async(ctx,next)=>{
        if(!ctx.session.user){
            await ctx.redirect('/')
        }else {
            let num = ctx.request.body.num;
            console.log(num);
            if(num.match(/1\d{10}/)&&num.toString().length === 11){
                ctx.response.body = await queryNum(num)
            }else{
                ctx.response.body = {
                    status:'input type error.'
                }
            }
        }

    });
    router.get('/logout',async (ctx)=> {
        ctx.session.user = '';
        ctx.session.password = '';
        ctx.flash('info','');
        await ctx.redirect('/')
    });
    router.get('*',async (ctx,next)=>{
        try {
            const status = ctx.status || 404;
            if (status === 404) {
                ctx.throw(404)
            }
        } catch (err) {
            ctx.status = err.status || 500;
            if (ctx.status === 404) {
                //Your 404.ejs
                console.log('main route 404 '+ctx.request.path);
                await ctx.render('404',{title:'page not find'})
            } else {
                //other_error.ejs
                await ctx.render('other_error')
            }
        }
    });

    return router;
};
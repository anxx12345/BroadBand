const puppeteer = require('puppeteer');
//const CREDS = require('./creds');
const cheerio = require('cheerio');
var page;
(async function () {
    const browser = await puppeteer.launch({
        args: ['--disable-features=site-per-process'],                                                                                                                                                                                                                                                    
        headless: false,
        timeout: 5000,
        // args: [`yz--proxy-server=10.245.0.223:10010`]
    });


    console.log("打开网页");
    page = await browser.newPage();
    //console.log(await page.evaluate(() => navigator.userAgent));
    await page.setUserAgent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, qlike Gecko) Cehrome/67.0.3372.0 Safari/537.36');
    console.log(await page.evaluate(() => navigator.userAgent));
    await page.goto('http://10.245.0.223:10010/wms/orderReply/replyInstallMenu.do');
    // await page.goto('http://10.245.0.223:10010');

    //await page.screenshot({path: 'example.png'});
    console.log("载入完成，登录");

    const USERNAME_SELECTOR = '#usernameTemp';
    const PASSWORD_SELECTOR = '#password1';
    const BUTTON_SELECTOR = '#loginBtn';

    await page.click(USERNAME_SELECTOR);
    await page.type(USERNAME_SELECTOR, '');
    await page.click(PASSWORD_SELECTOR);
    await page.type(PASSWORD_SELECTOR, '');
    await page.click(BUTTON_SELECTOR);
    console.log("登录完成，跳转查询页面");
    const QueryValue = '#queryValue';
    const QueryBtn = '#slideQueryArea > div > span:nth-child(2) > a.btn.btn_sp';
    await page.waitForNavigation(QueryBtn);
    let num = '055709931179'
    await page.type(QueryValue, num)
    // await page.type(QueryValue, '055701dddd25')
    await page.click(QueryBtn)
    const num_link = '#orderListTbl > tr > td:nth-child(4) > a';
    await page.waitForSelector(num_link)
    await page.click(num_link)

    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
    const newPage = await newPagePromise;
    const paidan = 'body > div.footer > a:nth-child(2) > span.rf_btn';
    await newPage.waitForSelector(paidan);
    await newPage.click(paidan)
    //await newPage.goto(`http://10.245.0.223:10010/wms/orderReply/orderReplyInstallPage.do?woIds=2901304&province=340000&busiNo=055709931179&_=153967657231`)
    const iframe = newPage.mainFrame().childFrames()
    // await newPage.goto(iframe.url())
    // console.log(iframe.url())
    const wuyongdiao = 'body > div.mainWrap.pdds11 > div:nth-child(3) > div.queryCond.clearfix > table.querytab > tbody > tr > td > input[type="radio"]:nth-child(1)';
    await newPage.waitForSelector(wuyongdiao)
    await newPage.click(wuyongdiao)
    const orderReplyBtn = 'body > div.footer > a.btn.btn_sp';
    await newPage.waitForSelector(orderReplyBtn);
    await newPage.click(orderReplyBtn)
    // const iframe = page.frames[1];
    const frame = await page
        .frames()
        .find(f => f.url().includes('busiNo=05570'))
        consol.log(frame.url())
    await frame.waitForSelector(wuyongdiao)    




    //await page.waitFor(DIAODU_BTN)
    // const DIAODU = '#apps > li:nth-child(1) > a';
    console.log("open new page.");
    // page.on('newpage', async (new_page) => {
    //     const url = new_page.url;
    //     console.log('Browser opened new tab', url);
    //     const page_diaodu = await new_page.page();
    // });
//     await page.waitForNavigation({
//         waitUntil: 'load'
//     });//等待页面加载出来，等同于window.onload
//     //await page.waitForNavigation();
//     const userManagerUrl = 'http://10.255.126.9:8081/oss/pages/user/user/UserList.seam';
//     await page.goto(userManagerUrl);
//     await page.waitFor('th');
//     console.log('redirect complete.');
//     //await page.waitForNavigation();
//     setInterval(function () {
//         //const userManagerUrl = 'http://10.255.126.9:8081/oss/pages/user/user/UserList.seam';
//         page.goto(userManagerUrl);
//         page.waitFor('th');
//         console.log('page reload success per 10s.')
//     }, 14400 * 1000)//六个小时刷新一次
// })();

// var query = async function (bandnum) {
//     var userIPTVnum = '', userIPTVmac = '',userStatus = '';
//     console.log("开始查询");
//     await page.click('#queryForm\\:broadbandID');
//     await page.evaluate(function() {
//         document.querySelector('#queryForm\\:broadbandID').value = ''
//     });
//     await page.type('#queryForm\\:broadbandID',bandnum);
//     //await page.type('#queryForm\\:broadbandID','x');

//     await page.click('#queryForm\\:search') ;
//     console.log("查询over,start cherrio");

//     let $userIPTVnum = '#dataForm\\:userList\\:0\\:userID';
//     let $userIPTVmac = '#dataForm\\:userList\\:0\\:stbMacAddress';
//     let $userStatus  = '#dataForm\\:userList\\:0\\:serviceStatus';
//     //await page.waitForNavigation();
//     await page.waitFor('th');

//     let bodyHTML = await page.evaluate(() => document.body.innerHTML);

//     //console.log(bodyHTML)
//     console.log("输出查询结果");

//     if(bodyHTML.toString().indexOf('oss/img/OSSpic_two.gif') !== -1){ //找到了无相关信息的图片提示，说明找不到信息。
//         console.log('查询不到用户IPTV信息');
//     }else {//如果能找到号码
//         let $ = cheerio.load(bodyHTML, {decodeEntities: false});
//         userIPTVnum = $($userIPTVnum).text();
//         userIPTVmac = $($userIPTVmac).text();
//         userStatus = $($userStatus).text();
//         //console.log("num:"+userIPTVnum+' mac '+userIPTVmac)
//     }

//     //await browser.close();
//     console.log('end');
//     return {
//         userIPTVnum:userIPTVnum,
//         userIPTVmac:userIPTVmac,
//         userStatus:userStatus
    // }
// };

})()

// (async ()=>{
//    let res = await query('056609806862');
//    console.log(res)
// })();
// module.exports = query;


//(async (bandNum) => {
//    const browser = await puppeteer.launch({headless:true});
//    //const browser = await puppeteer.launch({args: ['--no-sandbox']});
//
//    console.log("打开网页");
//    let page = await browser.newPage();
//    //console.log(await page.evaluate(() => navigator.userAgent));
//    await page.setUserAgent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3372.0 Safari/537.36');
//    console.log(await page.evaluate(() => navigator.userAgent));
//
//    await page.goto('http://10.255.126.9:8081/oss/login.seam');
//
//    await page.screenshot({path: 'example.png'});
//    console.log("载入完成，登录");
//
//    const USERNAME_SELECTOR = '#loginForm\\:usernameInput';
//    const PASSWORD_SELECTOR = '#loginForm\\:passwordInput';
//    const BUTTON_SELECTOR = '#loginForm\\:submit';
//
//
//    await page.click(USERNAME_SELECTOR);
//    await page.type(USERNAME_SELECTOR,'');
//    await page.click(PASSWORD_SELECTOR);
//    await page.type(PASSWORD_SELECTOR,'');
//    await page.click(BUTTON_SELECTOR);
//    console.log("登录完成，跳转查询页面");
//
//    //await page.waitForNavigation({
//    //    waitUntil: 'load'
//    //});//等待页面加载出来，等同于window.onload
//    await page.waitForNavigation();
//    const userManagerUrl = 'http://10.255.126.9:8081/oss/pages/user/user/UserList.seam';
//    await page.goto(userManagerUrl);
//    //await page.waitForNavigation();
//
//    console.log("跳转完成，开始查询");
//    await page.waitFor('th');
//    await page.click('#queryForm\\:broadbandID');
//    await page.type('#queryForm\\:broadbandID','056609806862');
//    //await page.type('#queryForm\\:broadbandID','x');
//
//    await page.click('#queryForm\\:search') ;
//    console.log("查询over,start cherrio");
//
//    let $userIPTVnum = '#dataForm\\:userList\\:0\\:userID';
//    let $userIPTVmac = '#dataForm\\:userList\\:0\\:stbMacAddress';
//    //await page.waitForNavigation();
//    await page.waitFor('th');
//
//    let bodyHTML = await page.evaluate(() => document.body.innerHTML);
//
//    //console.log(bodyHTML)
//    console.log("输出查询结果");
//
//    if(bodyHTML.toString().indexOf('oss/img/OSSpic_two.gif') !== -1){ //找到了无相关信息的图片提示，说明找不到信息。
//        console.log('查询不到用户IPTV信息');
//    }else {//如果能找到号码
//        let $ = cheerio.load(bodyHTML, {decodeEntities: false});
//        var userIPTVnum = $($userIPTVnum).text();
//        var userIPTVmac = $($userIPTVmac).text();
//        console.log("num:"+userIPTVnum+' mac '+userIPTVmac)
//    }
//
//    await browser.close();
//    return {
//        userIPTVnum:userIPTVnum,
//        userIPTVmac:userIPTVmac
//    }
//})();
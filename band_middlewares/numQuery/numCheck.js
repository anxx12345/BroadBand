const puppeteer = require('puppeteer');
var page;
let app = async function () {
    const browser = await puppeteer.launch({
        // args: ['--disable-features=site-per-process'],                                                                                                                                                                                                                                                    
        headless: true,
        timeout: 30000
        // args: [`yz--proxy-server=10.245.0.59:10010`]
    });


    console.log("打开网页");
    page = await browser.newPage();
    //console.log(await page.evaluate(() => navigator.userAgent));
    await page.setUserAgent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, qlike Gecko) Cehrome/67.0.3372.0 Safari/537.36');
    console.log(await page.evaluate(() => navigator.userAgent));
    await page.goto('http://10.245.0.59:10010/cspadmin/iserve/predealGuide/toMainPage.do');

    //await page.screenshot({path: 'example.png'});
    console.log("载入完成，登录");

    const USERNAME_SELECTOR = '#usernameTemp';
    const PASSWORD_SELECTOR = '#password1';
    const BUTTON_SELECTOR = '#loginBtn';

    await page.click(USERNAME_SELECTOR);
    await page.type(USERNAME_SELECTOR, 'szzt');
    await page.click(PASSWORD_SELECTOR);
    await page.type(PASSWORD_SELECTOR, 'szzt@001');
    await page.click(BUTTON_SELECTOR);
    console.log("登录完成，跳转查询页面");

    const QuerySelect = '#busiKey';
    const QueryValue = '#busiCode';
    const QueryBtn = '#btnSearch';
    let num = '18605579251'
    await page.waitForNavigation();
    await page.click('body > div.callWrap.clearfix > div.call.clearfix > div > div:nth-child(2) > div.left.w94 > div > span.carat')
    await page.click('body > div.callWrap.clearfix > div.call.clearfix > div > div:nth-child(2) > div.left.w94 > div > div > ul > li:nth-child(4)')
    await page.type(QueryValue, num)
    await page.click(QueryBtn)
    await page.click(QueryBtn)
    await page.waitFor('#deftList > li:nth-child(1)');
    console.log('query end....waiting for result.')
    const element = await page.$("#deftList");
    const text = await page.evaluate(element => element.textContent, element);
    let result;
    if (text.indexOf('05570') === -1) {
        result = 'no num';
    } else {
        result = /05570\d{7}/g.exec(text)[0];
    }
    await browser.close()
    console.log(result)
};
module.exports = app
app()
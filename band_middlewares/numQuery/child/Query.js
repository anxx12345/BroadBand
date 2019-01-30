const request = require('request').defaults({ jar: true });
const fs = require('fs');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const keys = require('../../../keys')
const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
};

function request_url(options) {
      // console.log(options.method)
      if (options.method === 'POST') {
            return new Promise(function (resolve, reject) {
                  request.post(options, function (err, res, body) {
                        resolve(res)
                  })
            });
      }
      if (options.method === 'GET') {
            return new Promise(function (resolve, reject) {
                  request.get(options, function (err, res, body) {
                        resolve(res)
                  })
            });
      }
}


async function app(num) {
      return new Promise(async (resovle, reject) => {
            let lt;
            // console.log('waiting......')
            let lt_get_options = {
                  url: 'http://10.245.0.59:10010/cas/login',
                  method: 'GET'
            }
            let lt_raw = await request_url(lt_get_options)

            lt = /LT-\d{8}-[\s\S]{30}/g.exec(lt_raw.body);
            lt = lt ? lt[0] : lt
            let validateCode_options = {
                  url: 'http://10.245.0.59:10010/cas/validateCodeServlet?' + new Date().getTime(),
                  method: 'GET'
            }
            let validateCode_raw = await request_url(validateCode_options);
            // console.log(lt_raw.headers['set-cookie'][0])
            // sessionID = /JSESSIONID=[\s\S]{32}/g.exec(lt_raw.headers['set-cookie'][0])[0]
            // console.log(sessionID)
            let options_login = {
                  method: 'POST',
                  url: 'http://10.245.0.59:10010/cas/login',
                  form: {
                        'lt': lt,
                        'execution': 'e1s1',
                        '_eventId': 'submit',
                        'username': keys.gongke.username,
                        'password': keys.gongke.password,
                        'vcode': '请输入验证码',
                        'usernameTemp': 'szzt',
                  }
            };
            let login_body = await request_url(options_login);
            // console.log(login_body.body)
            let mainPage_raw = await request_url({
                  method: 'GET',
                  url: 'http://10.245.0.59:10010/cspadmin/iserve/predealGuide/toMainPage.do'
            })
            // console.log(test_login_raw.body)
            let options_getUserInfo = {
                  url: 'http://10.245.0.59:10010/cspadmin/iserve/predealGuide/getUserList.do',
                  method: 'POST',
                  form: {
                        'sheetNo': '',
                        'busiKey': 4,
                        'callNo': '',
                        'busiCode': num,
                        'callId': '',
                        'areaCode': 550,
                        'inserted': false
                  }
            };
            let userInfo_raw = await request_url(options_getUserInfo);
            // console.log(userInfo_raw.body)
            let result = userInfo_raw.body.indexOf('05570') !== -1 ? /05570\d{7}/g.exec(userInfo_raw.body)[0] : false
            // console.log(result)
            //           resovle(result)
            await request_url({
                  method: 'GET',
                  url: 'http://10.245.0.59:10010/cas/logout'
            })
            // resovle(result)
            console.log(result)

      })
};

// let num = 18605579676
// app(num)
// module.exports = app;
// app({userNum:'055709956057'}).then(result=>console.log(result));

app(process.argv[2])
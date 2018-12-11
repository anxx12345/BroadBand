const request = require('request').defaults({jar:true});
const HEADERS = {'ua': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.125 Safari/537.36'};
const url = require('../keys').dingTalkUrl.url;

function talk(content) {
    let options1= {
        headers:HEADERS,
        url:url,
        json:{
            "msgtype": "markdown",
            "markdown": {
                "title":content.title,
                "text":content.text
            },
            "at": {
                "atMobiles": [
                    "18605579658","18605579725","18655706130"
                ],
                "isAtAll": false
            }
        }
    };
   
    request.post(options1, function (err,res,body) {
        console.log(body);
    });
}

module.exports =  talk;
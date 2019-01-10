const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const views = require('koa-views');
const path = require('path');
const flash = require('koa-connect-flash');

const app = new Koa();
app.keys = ['this is my personal session token. little doge'];

app.use(session({
    key: 'koa:sess', /** cookie的名称，可以不管 */
    maxAge: 3600000, /** (number) maxAge in ms (default is 1 days)，cookie的过期时间，这里表示2个小时 */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
},app));
app.use(flash());
app.use(bodyParser());
app.use(views('views', { map: {html: 'ejs'}}));//allow .html being unchanged.in this way, ejs can't recognise .ejs file

let staticFiles = require('./Middlewares/routes/static_files');
app.use(staticFiles('/static/',__dirname + '/static'));

const router = require('./Middlewares/mainRoutes')();

app.use(router.routes());

let port = 2018;
app.listen(port);
console.log(`app started at port ${port}`);

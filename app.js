
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var model = require('./routes/models');
var auth = require('./routes/auth')

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

// msg resource
app.get('/msgs', model.MsgFindAll);
app.get('/msgs/:id', model.MsgFindById);
app.post('/msgs', model.MsgAdd);
app.put('/msgs/:id', model.MsgPut);
app.delete('/msgs/:id', model.MsgDelete);

// auth
app.post('/login', auth.loginCtrl);
app.post('/logout', auth.logoutCtrl);
app.post('/register', auth.registerCtrl);
app.post('/getloginuser', auth.getLoginUser);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

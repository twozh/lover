"use strict";

var UserDB = require('./models').User;

/*
  return msg format:
  var GRETURN = {
  code: true,
  data:
}
 */
var GRETURN = {};

exports.loginCtrl = function(req, res){
  var postNameAndPass = req.body;

	UserDB.findOne(postNameAndPass, function(err, user){
		if (err) console.log(err);

		if (!user){
      GRETURN.code = false;
      GRETURN.data = "user or passwd do not exist.";
			res.send(GRETURN);
			return;
		}

		req.session.user_id = user._id;
    GRETURN.code = false;
    delete GRETURN.data;
		res.send(GRETURN);
	});
};

exports.logoutCtrl = function(){

};

exports.registerCtrl = function(req, res){
  var postLogInfo      = {};
  postLogInfo.name     = req.body.username;
  postLogInfo.password = req.body.password;

	if (!postLogInfo.name || !postLogInfo.password){
    GRETURN.code = false;
    GRETURN.data = "username/password should not be null";
		res.send(GRETURN);
		return;
	}

  UserDB.findOne({name: postLogInfo.name}, function(err, user){
    if (err) console.log(err);

    //user already exist.
    if (user){
      GRETURN.code = false;
      GRETURN.data = "username already exist.";
      res.send(GRETURN);
      return;
    }

    //user dose not exist
    var userNew = new UserDB(postLogInfo);
    userNew.save(function(err, result){
      if (err) console.log(err);

      GRETURN.code = true;
      GRETURN.data = "register success!";
      res.send(GRETURN);
    });
  });
};

/*
exports.verifySession = function(req, res, next){
	if (req.session.user_id) {
		console.log('veri pass');
    next();
  } else {
  console.log('veri not pass');
    //res.locals.status_code = 500;
    //res.send('error');
    //res.status(404);
    res.send(500, { error: 'you are not login'});
    //res.redirect('/login');
  }
};


exports.getLoginUser = function(req, res){
	var user_id = req.session.user_id;
	var obj = {};

	if (user_id) {
		var user = UserDB.findById(user_id, function(err, user){
			if (err) console.log(err);

			obj.user_id = user_id;
			obj.userName = user.name;

			res.send(obj);
		});
    } else {
      console.log('session is null');
      res.send(500, { error: 'cao, you are not login'});
    }
};

*/

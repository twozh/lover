"use strict";

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var GRETURN = {};

mongoose.connect("mongodb://localhost/lover");

var Msg = mongoose.model('Msg', mongoose.Schema({
  message: String,
  time:  {type: Date, default: Date.now, required: true},
  user_id: {type: ObjectId, ref: 'User', required: true},
}));

var User = mongoose.model('User', mongoose.Schema({
  name: {type: String, required: true},
  password: {type: String, required: true},
  email: String,
  inRelation: {type: String, required:true, default: "NO-RELATION"}, //NO-RELATION, ADDING, IN-RELATION

  relation: {type: ObjectId, ref: 'Relation'},
  request: [{type: String}],
}));

var Relation = mongoose.model("Relation", mongoose.Schema({
  user1: {type: ObjectId, ref: 'User'},
  user2: {type: ObjectId, ref: 'User'},
  msgs: [{type: ObjectId, ref: 'Msg'}],

}));


/*
  msg logic
 */
var checkSession = function(req, res, succCb){
  var user_id = req.session.user_id;

  if (user_id) {
    User.findById(user_id, function(err, user){
      if (err) console.log(err);

      if (!user) {
        delete GRETURN.data;
        GRETURN.code = "NOT-LOGIN";
        res.send(GRETURN);
        return;
      }

      succCb(user);
    });
  } else {
    delete GRETURN.data;
    GRETURN.code = "NOT LOGIN";

    res.send(GRETURN);
  }

};

exports.MsgFindAll = function(req, res){

  checkSession(req, res, function(user){
    if (user.inRelation === "NO-RELATION"){
      GRETURN.code = "NO-RELATION";
    } else if (user.inRelation  === "ADDING"){
      GRETURN.code = "ADDING";
    }
    else {
      GRETURN.code = "IN-RELATION";
    }

    res.send(GRETURN);
  });

/*
  Msg.find()
    .sort('-time')
    .populate('user_id', 'name')
    .exec(function(err, msgs){
      if (err) console.log(err);

      GRETURN.code = true;
      GRETURN.data = msgs;

      res.send(GRETURN);
    });
*/
};

exports.MsgFindById = function(req, res){
  var id = req.params.id;
  console.log('Retrieving msgs: ' + id);

  Msg.findById(id, function(err, msg){
    if (err) console.log(err);

    GRETURN.code = true;
    GRETURN.data = msg;
    res.send(GRETURN);
  });
};

exports.MsgAdd = function(req, res){
  var reqMsg = req.body;

  var msg = Msg(reqMsg);
  msg.save(function(err, msg){
    if (err) console.log(err);
      //Msg.findById(msg._id)
      //  .populate(user_id)

    GRETURN.code = true;
    GRETURN.data = msg;
    res.send(GRETURN);
  });
};

exports.MsgPut = function(req, res){
  var id = req.params.id;
  var reqMsg = req.body;
  Msg.findByIdAndUpdate(id, reqMsg, function(err, msg){
    if (err) console.log(err);
  });
};

exports.MsgDelete = function(req, res){
  var id = req.params.id;
  Msg.findByIdAndRemove(id, function(err, msg){
    if (err) console.log(err);

    GRETURN.code = true;
    delete GRETURN.data;

    console.log('del succ');
    res.send(GRETURN);
  });
  //console.log('del succ');
  //res.send("del succ!");
};

/*
  user logic
 */
exports.loginCtrl = function(req, res){
  var postNameAndPass = req.body;

  User.findOne(postNameAndPass, function(err, user){
    if (err) console.log(err);

    if (!user){
      GRETURN.code = false;
      GRETURN.data = "user or passwd does not exist.";
      res.send(GRETURN);
      return;
    }

    req.session.user_id = user._id;
    GRETURN.code = true;
    GRETURN.data = "login success.";
    res.send(GRETURN);
  });
};

exports.logoutCtrl = function(req, res){
  delete req.session.user_id;
  console.log("log out");

  GRETURN.code = true;
  delete GRETURN.data;
  res.send(GRETURN);
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

  User.findOne({name: postLogInfo.name}, function(err, user){
    if (err) console.log(err);

    //user already exist.
    if (user){
      GRETURN.code = false;
      GRETURN.data = "username already exist.";
      res.send(GRETURN);
      return;
    }

    //user dose not exist
    var userNew = new User(postLogInfo);
    userNew.save(function(err, result){
      if (err) console.log(err);

      GRETURN.code = true;
      GRETURN.data = "register success!";
      res.send(GRETURN);
    });
  });
};

exports.getLoginUser = function(req, res){
  var user_id = req.session.user_id;

  if (user_id) {
    User.findById(user_id, function(err, user){
      if (err) console.log(err);

      GRETURN.code      = true;
      GRETURN.data      = {};
      GRETURN.data.name = user.name;
      GRETURN.data._id  = user._id;

      res.send(GRETURN);
    });
  } else {
    delete GRETURN.data;
    GRETURN.code = false;
    res.send(GRETURN);
  }
};

/*
  other logic
 */
exports.appHandler = function(req, res){
  var reqData = req.body;

  if (reqData.code === "ADD"){

    User.findOne({name: reqData.data}, function(err, user){
      if (err) console.log(err);

      if (user){
        GRETURN.code = user.inRelation;
      } else {
        GRETURN.code = "NO-USER";
      }

      delete GRETURN.data;
      res.send(GRETURN);
      return;
    });
  }

};




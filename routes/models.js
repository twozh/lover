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
  //basic info
  name: {type: String, required: true},
  password: {type: String, required: true},
  email: String,

  //control info
  inRelation: {type: String, required:true, default: "NO-RELATION"}, //NO-RELATION, ADDING, IN-RELATION
  relationName: String,
  relation: {type: ObjectId, ref: 'Relation'},
  request: [{}],
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

      if (user){
        succCb(user);
        return;
      } else {
        delete GRETURN.data;
        GRETURN.code = "NOT-LOGIN";
        res.send(GRETURN);
      }
    });
  } else {
    delete GRETURN.data;
    GRETURN.code = "NOT-LOGIN";
    res.send(GRETURN);
  }
};

exports.MsgFindAll = function(req, res){

  checkSession(req, res, function(user){
    if (user.inRelation === "NO-RELATION"){
      GRETURN.code = "NO-RELATION";
      GRETURN.data = [];

      //deep copy the request
      for (var i = 0; i < user.request.length; i++){
        GRETURN.data.push(user.request[i]);
      }

      user.request = [];
      user.markModified('request');
      user.save();

      res.send(GRETURN);
    } else if (user.inRelation  === "ADDING"){
      GRETURN.code = "ADDING";
      GRETURN.data = user.relationName;

      res.send(GRETURN);
    } else if (user.inRelation  === "IN-RELATION"){
      GRETURN.code = "IN-RELATION";
      GRETURN.data = {};
      GRETURN.data.userName = user.name;
      GRETURN.data.theOneName = user.relationName;

      res.send(GRETURN);
    }
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

  switch (reqData.code){
    case "SEARCH-THE-ONE":
      User.findOne({name: reqData.data}, function(err, user){
        if (err) console.log(err);

        if (user){
          GRETURN.code = user.inRelation;
        } else {
          GRETURN.code = "NO-USER";
        }

        delete GRETURN.data;
        res.send(GRETURN);
      });
      break;

    case "ADD-THE-ONE":
      console.log("reciever: " + reqData.data.reciever);
      console.log("initiator: " + reqData.data.initiator);
      User.findOne({name: reqData.data.reciever}, function(err, user){
        if (err) console.log(err);

        var t = {};
        t.code = "ADD-THE-ONE";
        t.data = reqData.data.initiator;
        user.request.push(t);
        user.markModified('request');
        user.save();
      });

      User.findOne({name: reqData.data.initiator}, function(err, user){
        if (err) console.log(err);

        user.inRelation = "ADDING";
        user.relationName = reqData.data.reciever;
        user.save();
        GRETURN.code = true;
        res.send(GRETURN);
      });
      break;

    case "AGREE-THE-ONE":
      User.findOne({name: reqData.data.reciever}, function(err, userR){
        User.findOne({name: reqData.data.initiator}, function(err, userI){
          userR.inRelation = "IN-RELATION";
          userR.relationName = reqData.data.initiator;
          userR.save();

          userI.inRelation = "IN-RELATION";
          userI.save();

          GRETURN.code = true;
          delete GRETURN.data;
          res.send(GRETURN);
        });
      });
      break;

    case "CANCEL-ADD":
      User.findById(req.session.user_id, function(err, user){
        if (err) console.log(err);

        User.findOne({name: user.relationName}, function(err, userR){
          for (var i = 0; i < userR.request.length; i++){
            if (userR.request[i].code === "ADD-THE-ONE" &&
                userR.request[i].data === user.name){
              userR.request.splice(i, 1);
            }
          }

          userR.save();
        });

        user.inRelation = "NO-RELATION";
        user.relationName = "";
        user.save();

        GRETURN.code = true;
        res.send(GRETURN);
      });
      break;

    case "DISMISS-THE-ONE":

      User.findById(req.session.user_id, function(err, user){
        User.findOne({name: user.relationName}, function(err, theOne){
          user.inRelation = "NO-RELATION";
          user.save();
          theOne.inRelation = "NO-RELATION";
          theOne.save();

          GRETURN.code = true;
          delete GRETURN.data;
          res.send(GRETURN);
        });
      });
      break;
  }

};




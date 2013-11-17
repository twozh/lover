"use strict";

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var GRETURN = {};

var debugLog = function(input){
  //console.log(input);
};

mongoose.connect("mongodb://localhost/lover");

var Msg = mongoose.model('Msg', mongoose.Schema({
  message: {type:String, required: true},
  time:  {type: Date, default: Date.now, required: true},
  userName: {type: String, required: true},
  isnew: Boolean,
}));

var User = mongoose.model('User', mongoose.Schema({
  //basic info
  name: {type: String, required: true},
  password: {type: String, required: true},
  email: String,

  //control info
  inRelation: {type: String, required:true, default: "NO-RELATION"}, //NO-RELATION, ADDING, IN-RELATION
  relationName: String,
  request: [{}],

  msgList: {type: ObjectId, ref: 'MsgList'},
}));

var MsgList = mongoose.model("MsgList", mongoose.Schema({
  msgs: [{type: ObjectId, ref: "Msg"}],
}));

/*
  msg logic
 */
var checkSession = function(req, res, succCb){
  var user_id = req.session.user_id;

  if (user_id) {
    User.findById(user_id, function(err, user){
      if (err) debugLog(err);

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
};

/*
  user logic
 */
exports.loginCtrl = function(req, res){
  var postNameAndPass = req.body;

  User.findOne(postNameAndPass, function(err, user){
    if (err) debugLog(err);

    if (!user){
      GRETURN.code = false;
      GRETURN.data = "Username or password is not correct.";
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
  debugLog("log out");

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
    if (err) debugLog(err);

    //user already exist.
    if (user){
      GRETURN.code = false;
      GRETURN.data = "Username already exist.";
      res.send(GRETURN);
      return;
    }

    //user dose not exist
    var userNew = new User(postLogInfo);
    userNew.save(function(err, result){
      if (err) debugLog(err);

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
      if (err) debugLog(err);

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
  app logic
 */
exports.appHandler = function(req, res){

checkSession(req, res, function(sessionUser){
  var reqData = req.body;
  switch (reqData.code){
    case "SEARCH-THE-ONE":
      User.findOne({name: reqData.data}, function(err, user){
        if (err) debugLog(err);

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
      debugLog("the target one name: " + reqData.data);
      User.findOne({name: reqData.data}, function(err, targetUser){
        if (err) debugLog(err);

        if(targetUser){
          var t = {};
          t.code = "ADD-THE-ONE";
          t.data = sessionUser.name;
          targetUser.request.push(t);
          targetUser.markModified('request');
          targetUser.save();

          sessionUser.inRelation = "ADDING";
          sessionUser.relationName = reqData.data;
          sessionUser.save();
          GRETURN.code = true;
          res.send(GRETURN);
        }
      });
      break;

    case "AGREE-THE-ONE":
      debugLog("the one name is " + reqData.data);
      User.findOne({name: reqData.data}, function(err, initiator){
        if (err) debugLog(err);

        if(initiator){
          sessionUser.inRelation = "IN-RELATION";
          sessionUser.relationName = reqData.data;
          initiator.inRelation = "IN-RELATION";

          var msgList = new MsgList();
          msgList.save(function(err){
            initiator.msgList = msgList._id;
            sessionUser.msgList = msgList._id;

            sessionUser.save();
            initiator.save();

            GRETURN.code = true;
            delete GRETURN.data;
            res.send(GRETURN);
          });
        }
      });
      break;

    case "CANCEL-ADD":
      debugLog("CANCEL-ADD");
      User.findOne({name: sessionUser.relationName}, function(err, targetUser){
        for (var i = 0; i < targetUser.request.length; i++){
          if (targetUser.request[i].code === "ADD-THE-ONE" &&
              targetUser.request[i].data === sessionUser.name){
            targetUser.request.splice(i, 1);
          }
        }

        targetUser.save();
      });

      sessionUser.inRelation = "NO-RELATION";
      sessionUser.relationName = "";
      sessionUser.save();

      GRETURN.code = true;
      res.send(GRETURN);
      break;

    case "DISMISS-THE-ONE":
      debugLog("DISMISS-THE-ONE");
      User.findOne({name: sessionUser.relationName}, function(err, theOne){
        MsgList.findById(sessionUser.msgList)
        .populate('msgs')
        .exec(function(err, msgList){
          for (var i = 0; i < msgList.msgs.length; i++){
            msgList.msgs[i].remove();
          }
          msgList.remove(function(){
            debugLog("remove msgList OK");
          });
        });

        sessionUser.inRelation = "NO-RELATION";
        sessionUser.msgList = null;
        sessionUser.save();
        theOne.inRelation = "NO-RELATION";
        theOne.msgList = null;

        theOne.save();

        GRETURN.code = true;
        delete GRETURN.data;
        res.send(GRETURN);
      });
      break;

    case "POST-MSG":
      debugLog("POST-MSG: " + reqData.data);
      User.findOne({name: sessionUser.relationName}, function(err, theOne){
        MsgList.findById(sessionUser.msgList, function(err, msgList){
          var msg = new Msg({message: reqData.data, userName: sessionUser.name, isnew: true});
          msg.save(function(err){
            debugLog(err);

            msgList.msgs.push(msg._id);
            msgList.save();

            GRETURN.code = true;
            GRETURN.data = msg;
            res.send(GRETURN);
          });
        });
      });
      break;

    case "RETRIEVE-MSG":
      debugLog("RETRIEVE-MSG");
      MsgList.findById(sessionUser.msgList).populate('msgs').exec(function(err, msgList){
        debugLog("RETRIEVE-MSG: " + msgList.msgs.length);
        var l = 0;
        if (msgList.msgs.length > 10){
          l = msgList.msgs.length - 10;
        }

        GRETURN.code = true;
        GRETURN.data = [];
        for (var i = msgList.msgs.length - 1; i >= l; i--){
          GRETURN.data.push(msgList.msgs[i]);
        }

        res.send(GRETURN);
      });
      break;
  }

});
};




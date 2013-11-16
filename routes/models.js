"use strict";

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var GRETURN = {};

var debugLog = function(input){
  console.log(input);
};

mongoose.connect("mongodb://localhost/lover");

var Msg = mongoose.model('Msg', mongoose.Schema({
  message: String,
  time:  {type: Date, default: Date.now, required: true},
  user: {type: ObjectId, ref: 'User', required: true},
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
var Relation = mongoose.model("Relation", mongoose.Schema({
  user1: {type: ObjectId, ref: 'User'},
  user2: {type: ObjectId, ref: 'User'},
  msgs: [{type: ObjectId, ref: 'Msg'}],

}));
*/


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
checkSession(req, res, function(sessionUser){
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
      console.log("the target one name: " + reqData.data);
      User.findOne({name: reqData.data}, function(err, targetUser){
        if (err) console.log(err);

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
        if (err) console.log(err);

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
            msgList.msgs[i].remove(function(){
              debugLog("remove msg OK");
            });
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
          var msg = new Msg({message: reqData.data, user: sessionUser._id, isnew: true});
          msg.save(function(err){
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
      MsgList.findById(sessionUser.msgList).populate('msgs').exec(function(err, msgList){
        debugLog("RETRIEVE-MSG: " + msgList.msgs.length);
        for (var i = 0; i < msgList.msgs.length; i++){
          debugLog(msgList.msgs[i].message);
          debugLog(msgList.msgs[i].user);
        }

        GRETURN.code = true;
        GRETURN.data = msgList.msgs;
        res.send(GRETURN);
      });
      break;
  }

});
};




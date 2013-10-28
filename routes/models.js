"use strict";

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

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
}));

//extern User Obj
exports.User = User;

/*
  return msg format:
  var GRETURN = {
  code: true,
  data:
}
 */
var GRETURN = {};

exports.MsgFindAll = function(req, res){
  Msg.find(function(err, msgs){
    if (err) console.log(err);

    GRETURN.code = true;
    GRETURN.data = msgs;
    res.send(GRETURN);
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


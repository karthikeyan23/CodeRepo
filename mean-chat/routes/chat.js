var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Chat = require('../models/Chat.js');
var apiai = require('apiai');

server.listen(4000);

// socket io
io.on('connection', function (socket) {
  console.log('User connected');
  socket.on('disconnect', function () {
    console.log('User disconnected');
  });
  socket.on('save-message', function (data) {
    console.log("save-message");
    console.log(data);
    io.emit('new-message', { message: data });
  });
});

/* GET ALL CHATS */
router.get('/:room', function (req, res, next) {
  Chat.find({ room: req.params.room }, function (err, chats) {
    if (err) return next(err);
    res.json(chats);
  });
});

/* GET SINGLE CHAT BY ID */
router.get('/:id', function (req, res, next) {
  Chat.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* SAVE CHAT */
router.post('/', function (req, res, next) {
  Chat.create(req.body, function (err, post) {
    if (err) return next(err);
    sendDF(req.body);
    res.json(post);
  });
});

/* UPDATE CHAT */
router.put('/:id', function (req, res, next) {
  Chat.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE CHAT */
router.delete('/:id', function (req, res, next) {
  Chat.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});


function sendDF(message) {

  var app = apiai("ae02f46f39f94a9e9faa5d05777d7f01");
  var resMessage = message;
  resMessage.nickname = message.room;
  var request = app.textRequest(message.message, {
    sessionId: 'test'
  });

  request.on('response', function (response) {
    console.log(response);
    console.log(response.result.fulfillment.speech);
    resMessage.message = response.result.fulfillment.speech;
    Chat.create(resMessage);    
    io.emit('new-message', { message: resMessage });
  });

  request.on('error', function (error) {
    console.log(error);
  });

  request.end();

}

module.exports = router;
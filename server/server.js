const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const {generateMessage} = require('./utils/message');
const {generateLocationMessage}= require('./utils/message');
const {isRealString} = require('./utils/validation');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));


io.on('connection', (socket) => {
   console.log('new user connected');
   
    socket.emit('newMessage', generateMessage('admin', 'welcome to chat message'));

    socket.broadcast.emit('newMessage', generateMessage('admin', 'new user joinied'));
       
   socket.on('join', (params, callback) => {
     if (!isRealString(params.name) || !isRealString(params.room)){
         callback('Name and room name are required');
     }     

     callback();
   }) ;

   socket.on('createMessage', (message, callback) => {
       io.emit('newMessage', generateMessage(message.from, message.text));
       callback();
   });   

   socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('admin', coords.latitude, coords.longitude))  
   });

   socket.on('disconnect', () => {
     console.log('cliented disconnected');
   });
})

server.listen(port, () => {
    console.log('server is running');
})


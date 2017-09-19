const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const {generateMessage} = require('./utils/message');
const {generateLocationMessage}= require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var users = new Users();

app.use(express.static(publicPath));


io.on('connection', (socket) => {
   console.log('new user connected');
   
   socket.on('join', (params, callback) => {

     if (!isRealString(params.name) || !isRealString(params.room)){
       return  callback('Name and room name are required');
     }     

     socket.join(params.room);
     users.removeUser(socket.id);
     users.addUser(socket.id, params.name, params.room);

     io.to(params.room).emit('updateUsersList', users.getUserList(params.room));

     socket.emit('newMessage', generateMessage('admin', 'welcome to chat message'));
     
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('admin', `${params.name} has joinied`));
          

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
       var user = users.removeUser(socket.id);
       if (user) {
           io.to(user.room).emit('updateUsersList', users.getUserList(user.room));

           io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`))
       }
     console.log('cliented disconnected');
   });
})

server.listen(port, () => {
    console.log('server is running');
})


const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generalMessages, generalLocationMessages } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


const port = 3000;

const publicDirectryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectryPath));

// let count = 0;

io.on('connection', (socket) => {
    
    socket.on('join', (options, callback) => {

        const { error, user } = addUser({id: socket.id, ...options }); 
        
        if (error) {
             callback(error)
             return
        }

        socket.join(user.room);
        socket.emit('message', generalMessages(user.username,'Welcome!'));
        socket.broadcast.to(user.room).emit('message', generalMessages('Admin',`${user.username} has joined`));

        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback() 
    });
     

    socket.on('sendMessage', (message, callback) => {
        let user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('CallBack is not allowed')
        }

        io.to(user.room).emit('message', generalMessages(user.username, message));
        callback();
    })

    socket.on('sendLocation', (coords, callback) => {
        let user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generalLocationMessages(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })
    // socket.emit('countUpdated', count);

    // socket.on('increment', () => {
    //     count++;
    //     //socket.emit('countUpdated', count);
    //     io.emit('countUpdated', count);
    // });

    socket.on('disconnect', () => {
        let user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generalMessages(`${user.username} has left!`));

            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    });
})

server.listen(port, () => {
    console.log(`server started at port ${port}`);
})
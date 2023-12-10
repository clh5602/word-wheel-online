const http = require('http');
const { Server } = require('socket.io');
const game = require('./game.js');

let io;

const handleChatMessage = (socket, msg) => {
    socket.rooms.forEach(room => {
        if(room == socket.id) return; 

        io.to(room).emit('chat message', msg);
    });
};

const socketSetup = (app) => {
    const server = http.createServer(app);
    io = new Server(server);

    io.on('connection', (socket) => {
        console.log('a user connected');

       // add user to a random room
        socket.join(game.joinRoom());

        socket.on('disconnect', () => {
            console.log('a user disconnected');
        });

        /* We need to pass down the current socket into each of these
           handler functions. Be aware that we can't globalize socket
           in this file otherwise it will be overwritten each time a
           new user connects. It is easier and far safer to simply pass
           it down into our handler functions in this way.
        */
        socket.on('chat message', (msg) => handleChatMessage(socket, msg));
        socket.on('room change', (room) => handleRoomChange(socket, room));
    });

    game.populateRooms;

    return server;
};

module.exports = socketSetup;
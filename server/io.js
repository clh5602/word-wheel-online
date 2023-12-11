const http = require('http');
const { Server } = require('socket.io');
const game = require('./game.js');

let io;

const answerEntryBegin = (socket) => {
    // should only have two rooms, the game room and a room with only the socket
    socket.rooms.forEach(room => {
        if(room == socket.id) return; // ignore its private room

        if (game.tryRoomBeginAnswer(room)) {
            // the above function will tell the room
            // to wait for an answer, if it exists

            // now, tell the clients to wait
            io.to(room).emit('beginTyping', socket.id);
        }
        
    });
};

const checkAnswer = (socket, answer, username) => {
    // should only have two rooms, the game room and a room with only the socket
    socket.rooms.forEach(room => {
        if(room == socket.id) return; // ignore its private room

        const resObj = game.checkPuzzleAnswer(room, answer);
        
        if (resObj) {
            // check for correctness
            if (resObj.correct) {
                // correct answer, send everyone to results
                io.to(room).emit('gameSolved', {
                    winner: username,
                    solution: resObj.puzzle,
                    prize: resObj.prize
                });
            } else {
                // answer was not correct, continue game
                io.to(room).emit('gameResume', socket.id);
            }
        }
        // fall through - if no resObj, then the room DNE
    });
}

const displayGuess = (socket, guess) => {
    // should only have two rooms, the game room and a room with only the socket
    socket.rooms.forEach(room => {
        if(room == socket.id) return; // ignore its private room

        io.to(room).emit('userTyped', guess);
    });
}

const socketSetup = (app) => {
    const server = http.createServer(app);
    io = new Server(server);

    io.on('connection', (socket) => {
        console.log('a user connected');

       // add user to a random room
       const joinObj = game.joinRoom();
        socket.join(joinObj.roomID);
        

        socket.on('disconnect', () => {
            console.log('a user disconnected');
        });

        /* We need to pass down the current socket into each of these
           handler functions. Be aware that we can't globalize socket
           in this file otherwise it will be overwritten each time a
           new user connects. It is easier and far safer to simply pass
           it down into our handler functions in this way.
        */
        socket.on('answerBegin', () => answerEntryBegin(socket));
        socket.on('answerCheck', (ansObj) => checkAnswer(socket, ansObj.answer, ansObj.username));
        socket.on('userType', (msg) => displayGuess(socket, msg));

        // start game if room is full
        if (joinObj.startGame) {
            io.to(joinObj.roomID).emit("gameStart", joinObj.startGame);
        } else {
            io.to(joinObj.roomID).emit("newUser", joinObj.playerCount);
        }
    });

    return server;
};

const respondToAllRooms = () => {
    const updates = game.updateRooms();

    updates.forEach((obj) => {
        io.to(obj.roomID).emit("gameUpdate", obj.puzzle);
    });
};

setInterval(respondToAllRooms, 1000);

module.exports = socketSetup;
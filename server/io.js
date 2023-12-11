const http = require('http');
const { Server } = require('socket.io');
const game = require('./game.js');

let io;

const answerEntryBegin = (socket, username) => {
    // should only have two rooms, the game room and a room with only the socket
    socket.rooms.forEach(room => {
        if (room === socket.id) return; // ignore its private room

        if (game.tryRoomBeginAnswer(room)) {
            // the above function will tell the room
            // to wait for an answer, if it exists

            // now, tell the clients to wait
            io.to(room).emit('beginTyping', username);
        }

    });
};

const checkAnswer = (socket, answer, username) => {
    // should only have two rooms, the game room and a room with only the socket
    socket.rooms.forEach(room => {
        if (room === socket.id) return; // ignore its private room

        const resObj = game.checkPuzzleAnswer(room, answer);

        if (resObj) {
            // check for correctness
            if (resObj.correct) {
                // correct answer, send everyone to results
                io.to(Number(room)).emit('gameSolved', {
                    winner: username,
                    solution: resObj.puzzle,
                    prize: resObj.prize
                });
            } else {
                // answer was not correct, continue game
                io.to(Number(room)).emit('gameResume', {
                    loser: username,
                    revealed: resObj.revealed
                });
            }
        }
        // fall through - if no resObj, then the room DNE
    });
}

const displayGuess = (socket, guess) => {
    // should only have two rooms, the game room and a room with only the socket
    socket.rooms.forEach(room => {
        if (room === socket.id) return; // ignore its private room

        io.to(Number(room)).emit('userTyped', guess);
    });
}

const joinRoom = (socket) => {
    // add user to a random room
    const joinObj = game.joinRoom();
    socket.join(joinObj.roomID);

    console.log(`Joined room ${joinObj.roomID}`);

    // start game if room is full
    if (joinObj.startGame) {
        io.to(joinObj.roomID).emit("gameStart", joinObj.startGame);
    } else {
        io.to(joinObj.roomID).emit("newUser", joinObj.playerCount);
    }
}

const socketSetup = (app) => {
    const server = http.createServer(app);
    io = new Server(server);

    io.on('connection', (socket) => {
        socket.on('answerBegin', (username) => answerEntryBegin(socket, username));
        socket.on('answerCheck', (ansObj) => checkAnswer(socket, ansObj.answer, ansObj.username));
        socket.on('userType', (msg) => displayGuess(socket, msg));
        socket.on('joinRoom', () => joinRoom(socket));
    });

    return server;
};

const respondToAllRooms = () => {
    const updates = game.updateRooms();

    updates.forEach((obj) => {
        if (obj.fail) {
            // puzzle time up
            io.to(Number(obj.roomID)).emit("gameSolved", {
                solution: obj.puzzle,
            });
        } else {
            // puzzle revealed new letter
            io.to(Number(obj.roomID)).emit('gameUpdate', obj.puzzle);
        }

    });
};

setInterval(respondToAllRooms, 1200);

module.exports = socketSetup;
import puzzles from './wwo-puzzles.json' assert { type: 'json' };
const Room = require('./Room.js'); // Room class

const rooms = {};
const ID_LENGTH = 8;
const CHECK_INTERVAL = 10000;
const puzzleCount = puzzles.length;
let currentID = false;

const CHAR_NUM_OFFSET = 48; // unicode '0'
const CHAR_LETTER_OFFSET = 65; // unicode 'A'

// creates a random ID consisting of four digits,
// with values from 0-9 and A-Z
// NOTE: ID is not guaranteed to be unique
const generateID = () => {
    let resultingID = '';

    for (let i = 0; i < ID_LENGTH; i++) {
        let randomInt = Math.floor(Math.random() * 36);
        let newChar = '';

        if (randomInt < 10) {
            newChar = String.fromCharCode(randomInt + CHAR_NUM_OFFSET);
        } else {
            randomInt -= 10;
            newChar = String.fromCharCode(randomInt + CHAR_LETTER_OFFSET);
        }

        resultingID += newChar;
    }

    return resultingID;
};


const createRoom = () => {

    // generate IDs until a unique one is created
    let newID = generateID();
    while (!rooms[newID]) {
        newID = generateID();
    }

    // create a room for that ID
    let newRoom = new Room.Room(newID);

    // update in dictionary
    rooms[newID] = newRoom;

    currentID = newID;
};

const getRandomPuzzle = () => {
    return puzzles[Math.floor(Math.random() * puzzleCount)];
};

const tryRoomBeginAnswer = (roomID) => {
    const goalRoom = rooms[roomID];

    if (!goalRoom) {
        // room DNE
        return false;
    }

    if (goalRoom.beingAnswered) {
        // room has already been paused
        return false;
    }

    goalRoom.waitForAnswer();

    return true;
};

// this function checks to see if the provided answer is
// correct
const checkPuzzleAnswer = (roomID, answer) => {
    const goalRoom = rooms[roomID];
    if (!goalRoom) {
        // room DNE, return false
        return false;
    }

    // return an object that contains data
    // about the guess

    const resObj = goalRoom.checkAnswer(answer);

    // if this answer was correct, can destroy room
    if (resObj.correct) {
        goalRoom.freeRoom();
    }

    return resObj;
}

const joinRoom = () => {
    // returns the room ID for an empty room, and starts it if full
    if (!currentID) {
        createRoom();
    }

    let roomID = currentID;
    let startGame = false;

    // add to room, check if full
    if(rooms[roomID].incrementUserCount()){
        // now room is full, begin game shortly and create new room
        const puzzleObj = getRandomPuzzle();
        startGame = rooms[roomID].initializePuzzle(puzzleObj.puzzle, puzzleObj.category);
        createRoom();
    }

    const playerCount = rooms[roomID].playerCount;

    return {roomID, startGame, playerCount};
};

// reveals
const updateRooms = () => {
    // capture the keys
    const roomIDs = rooms.keys();
    const roomArr = [];

    roomIDs.forEach((roomID) => {
        const current = rooms[roomID];
        if (current.allRevealed) {
            // puzzle has failed, all letters shown
            roomArr.push({
                roomID,
                puzzle: current.revealLetter(),
                fail: true
            });
        } else if (current.gameStart && !current.beingAnswered) {
            roomArr.push({
                roomID,
                puzzle: current.revealLetter()
            });
        }
    });

    return roomArr;
}

// free rooms
const clearEmptyRooms = () => {
    // capture the keys
    const roomIDs = rooms.keys();

    roomIDs.forEach((x) => {
        if (rooms[x].delete) {
            delete rooms[x];
        }
    });
};

setInterval(clearEmptyRooms, CHECK_INTERVAL);

module.exports = {
    joinRoom,
    populateRooms,
    tryRoomBeginAnswer,
    checkPuzzleAnswer,
    updateRooms
}
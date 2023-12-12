/**
 * This list of 500 puzzles was sourced from season 39 of Wheel Of Fortune.
 * Retrieved from https://buyavowel.boards.net/page/compendium39
 */
const puzzles = require('./wwo-puzzles.json');
const Room = require('./Room.js'); // Room class

const rooms = {}; // dictionary of open rooms
const ID_MAX = 100000; // number of unique room IDs 
const CHECK_INTERVAL = 10000; // how often to clean empty rooms (in millis)
const puzzleCount = puzzles.length; // how many puzzles are there
let currentID = false; // rooms fill in order, this stores the current unfilled room

// NOTE: ID is not guaranteed to be unique
const generateID = () => Math.floor(Math.random() * ID_MAX);

// there are no empty rooms, so make a new one
const createRoom = () => {
  // generate IDs until a unique one is created
  let newID = generateID();
  while (rooms[newID]) {
    newID = generateID();
  }

  // create a room for that ID
  const newRoom = new Room.Room(newID);

  // update in dictionary
  rooms[newID] = newRoom;

  currentID = newID;
};

// gets a random puzzle from the wwo json
const getRandomPuzzle = () => puzzles[Math.floor(Math.random() * puzzleCount)];

// pauses a room from updating while someone types an answer
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
};

const joinRoom = () => {
  // returns the room ID for an empty room, and starts it if full
  if (!currentID) {
    createRoom();
  }

  const roomID = currentID;
  let startGame = false;

  // add to room, check if full
  if (rooms[roomID].incrementUserCount()) {
    // now room is full, begin game shortly and create new room
    const puzzleObj = getRandomPuzzle();
    startGame = rooms[roomID].initializePuzzle(puzzleObj.puzzle, puzzleObj.category);
    createRoom();
  }

  const { playerCount } = rooms[roomID];

  return { roomID, startGame, playerCount };
};

// for every room, reveal a letter if it's in play,
// and store a list of rooms that have been updated.
// io.js will notify players in every updated room
const updateRooms = () => {
  // capture the keys
  const roomIDs = Object.keys(rooms);
  const roomArr = [];

  roomIDs.forEach((roomID) => {
    const current = rooms[roomID];
    if (current.delete) return;

    if (current.allRevealed) {
      // puzzle has failed, all letters shown
      roomArr.push({
        roomID,
        puzzle: current.revealLetter(),
        fail: true,
      });
    } else if (current.gameStart && !current.beingAnswered) {
      roomArr.push({
        roomID,
        puzzle: current.revealLetter(),
      });
    }
  });

  return roomArr;
};

// free rooms that are finished
const clearEmptyRooms = () => {
  // capture the keys
  const roomIDs = Object.keys(rooms);

  roomIDs.forEach((x) => {
    if (rooms[x].delete) {
      delete rooms[x];
    }
  });
};

// clear the rooms every CHECK_INTERVAL millis
setInterval(clearEmptyRooms, CHECK_INTERVAL);

module.exports = {
  joinRoom,
  tryRoomBeginAnswer,
  checkPuzzleAnswer,
  updateRooms,
};

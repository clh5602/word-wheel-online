import puzzles from './wwo-puzzles.json' assert { type: 'json' };
const Room = require('./Room.js'); // Room class

const rooms = {};
const roomIDs = [];
const NUM_ROOMS = 100;
const ID_LENGTH = 4;
const CHECK_INTERVAL = 1000;
const puzzleCount = puzzles.length;
let roomIndex = 0;

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

// fills the rooms obj with a bunch of unoccupied
// rooms. The amount of rooms is based on "NUM_ROOMS"
const populateRooms = () => {
  let i = 0;
  let newID;

  while (i < NUM_ROOMS) {
    newID = generateID();

    if (!rooms[newID]) {
      i++;
      rooms[newID] = new Room.Room(newID);
      roomIDs.push();
    }
  }
};

const getRandomPuzzle = () => {
    return puzzles[Math.floor(Math.random() * puzzleCount)];
}


const MAX_POINTS = 8000;
const SECOND_DEDUCTION = 150;

class Room {
    constructor(id) {
        this.id = id;
        this.puzzle = [];
        this.category = 'NA';
        this.revealed = [];
        this.puzzleLength = 0;
        this.occupied = false;
        this.beingAnswered = false;
        this.players = 0;
        this.gameStart = new Date();

        // keeps track of how long the game was paused
        // does not penalize players for how long it takes
        // for them to type
        this.pauseBegin = new Date();
        this.pausedCount = 0;
    }

    initializePuzzle(puzzle, category) {
        this.gameStart = new Date();
        this.category = category;
        this.puzzle = puzzle.trim().split('');

        // copy puzzle over to revealed, with underscores
        this.revealed = [];
        this.puzzleLength = puzzle.length;
        for (let i = 0; i < this.puzzleLength; i++) {
            if (this.puzzle[i] === ' ') {
                this.revealed[i] = ' ';
            } else {
                this.revealed[i] = '_';
            }
        }

        this.occupied = false;
    }

    revealLetter() {
        // check if there are empty spaces and should update
        if (!this.beingAnswered && this.revealed.some((x) => x === '_')) {
            // reveal a random letter

            // choose a random index
            let randInd = Math.floor(Math.random() * this.puzzleLength);
            while (this.revealed[randInd] != '_') {
                randInd = Math.floor(Math.random() * this.puzzleLength);
            }

            // copy over from complete puzzle
            this.revealed[randInd] = this.puzzle[randInd];

            // return new phrase
            return this.revealed.join();
        }

        // just return the puzzle string
        return this.revealed.join();
    }

    freeRoom() {
        this.beingAnswered = false;
        this.occupied = false;
        this.pausedCount = 0;
        this.players = 0;
    }

    waitForAnswer() {
        // sets a flag - when this is true, stop updating the puzzle
        this.beingAnswered = true;
        this.pauseBegin = new Date();
    }

    checkAnswer(ansStr) {

        // add to paused time
        this.pausedCount = Math.abs(this.pausedCount.getTime() - new Date().getTime());

        let payout = Math.abs(new Date().getTime() - this.pausedCount); // subtract paused time from current
        payout = Math.abs(this.gameStart.getTime() - payout); // millis between game start and now
        payout = MAX_POINTS - Math.floor(payout / 1000) * SECOND_DEDUCTION; // point reward
        payout = Math.round(payout);
        payout = Math.min(1000, payout);

        response = {
            correct: (this.puzzle.join().toUpperCase() === ansStr.toUpperCase()),
            prize: payout,
        }

        this.beingAnswered = false;
        return response;

    }


}

// exports to set functions to public
module.exports = {
    Room,
};
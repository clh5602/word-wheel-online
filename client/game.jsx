const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const socket = io();

// global vars
let puzzleCategory = ""; // category string
let currentRevealed = []; // arr of revealed letters
let myGuess = []; // arr for keyboard input
let underscoreIndices = []; // indices for each empty spot in the puzzle
let curIndex = -1; // used for keyboard input
let curAccount;

// html shown when waiting for others to join
const JoiningPage = (props) => {
    if (!props.playerCount) {
        return (
            <div class="joining">
                <h1>Joining Game...</h1>
            </div>
        );
    }

    return (
        <div class="joining">
            <h1>Joining Game...</h1>
            <h2>Party: {props.playerCount}/3</h2>
        </div>
    );
};

// renders the puzzle and category
const GamePage = (props) => {
    return (
        <div class="game">
            <h1 id="puzzle">{props.puzzle}</h1>
            <h2 id="category">{puzzleCategory}</h2>
        </div>
    );
};

// replaces the buzz button when someone else is typing
const WhosTypingHTML = (props) => {
    return (
        <h2 id="typingMessage">{props.username} is typing their guess...</h2>
    );
};

// instructs the user how to enter their answer
const ImTypingHTML = (props) => {
    return (
        <h2 id="typingMessage">Please type your answer with the keyboard. Press "ENTER" when finished.</h2>
    );
};

// notify the server that a user wishes to begin typing
const beginTyping = (e) => {
    // tell everyone that they are typing
    socket.emit('answerBegin', curAccount.username);
}

// once someone buzzes in, read their keystrokes
// this unfortunately means it's broken on mobile :(
const handleKeyPress = (e) => {
    let updateFlag = false;

    // enter pressed, submit guess
    if (e.keyCode === 13) {
        const response = {
            answer: myGuess.join(''),
            username: curAccount.username
        }
        socket.emit('answerCheck', response);
    }

    // backspace
    if (e.keyCode === 8) {
        // make sure there are things to erase
        if (curIndex < 0) return;
        // replace current index with underscore
        myGuess[underscoreIndices[curIndex]] = "_";
        // move back
        curIndex--;
        updateFlag = true;
    }

    // only accept keys a-z
    if (e.keyCode >= 65 && e.keyCode <= 90) {
        // move index forward if possible
        if (curIndex >= underscoreIndices.length - 1) return;
        curIndex++;

        // replace the underscore with the keypress
        myGuess[underscoreIndices[curIndex]] = e.key.toUpperCase();

        updateFlag = true;
    }

    // update everyone else
    if (updateFlag) {
        socket.emit('userType', myGuess.join(''));
    }
}

// get rid of the buzz in button, someone wishes to enter an answer
const someoneTyping = (user) => {
    // check who is typing
    if (user === curAccount.username) {
        // I am the one typing
        ReactDOM.render(
            <ImTypingHTML />,
            document.getElementById('playerInput')
        );

        // capture the current revealed letters
        currentRevealed = document.getElementById('puzzle').textContent.split("");
        // copy over
        myGuess = currentRevealed.slice();
        // find the indices of all underscores
        underscoreIndices = [];
        for (let i = 0; i < myGuess.length; i++) {
            if (myGuess[i] === "_") {
                underscoreIndices.push(i);
            }
        }

        // add key event handler
        document.addEventListener('keydown', handleKeyPress);
    }
    else {
        // wait for someone to stop typing
        ReactDOM.render(
            <WhosTypingHTML username={user} />,
            document.getElementById('playerInput')
        );
    }
}

// butt lmao
const BuzzInButton = (props) => {
    return (
        <button type="button" onClick={beginTyping}>Buzz In!</button>
    );
};

// can no longer buzz in, incorrect answer
const LoseMessage = (props) => {
    return (
        <h2 id="typingMessage">Incorrect answer - unable to guess again!</h2>
    );
};

// results screen when no one guessed the answer in time
const NoWinner = (props) => {
    return (
        <div class="results">
            <h2>No Winner!</h2>
            <div>
            <h3>Solution</h3>
            <h1>"{props.puzzle}"</h1></div>
            <a href="/landing"><button>Home</button></a>
        </div>
    );
};

// results screen when someone wins
const Winner = (props) => {
    return (
        <div class="results">
            <h2>{props.winner} Wins!</h2>
            <h3 class='points'>+{props.prize} points</h3>
            <div>
            <h3>Solution</h3>
            <h1>"{props.puzzle}"</h1>
            </div>
            <a href="/landing"><button>Home</button></a>
        </div>
    );
};

// when someone new joins the room, update the waiting page
const updatePlayerCount = (count) => {
    ReactDOM.render(
        <JoiningPage playerCount={count} />,
        document.getElementById('content')
    );
};

// gayum
const renderGamePage = (puzzObj) => {
    // capture category
    puzzleCategory = puzzObj.category;

    // render puzzle area html
    ReactDOM.render(
        <GamePage puzzle={puzzObj.puzzle} />,
        document.getElementById('content')
    );

    // render button input area
    ReactDOM.render(
        <BuzzInButton />,
        document.getElementById('playerInput')
    );
}

// when someone enters an incorrect guess
const resumeGame = (resObj) => {
    document.removeEventListener('keydown', handleKeyPress);
    // render the puzzle again
    ReactDOM.render(
        <GamePage puzzle={resObj.revealed} />,
        document.getElementById('content')
    );

    // if you were the one who guessed...
    if (curAccount.username === resObj.loser) {
        // ... unable to guess again
        ReactDOM.render(
            <LoseMessage />,
            document.getElementById('playerInput')
        );
    } else {
        // you can guess again
        ReactDOM.render(
            <BuzzInButton />,
            document.getElementById('playerInput')
        );
    }
}

// send em to the results page
const gotoResults = (obj) => {
    document.getElementById('playerInput').innerHTML = "";

    if (!obj.winner) {
        // nobody won, go to loser page
        ReactDOM.render(
            <NoWinner puzzle={obj.solution} />,
            document.getElementById('content')
        );
    } else {
        // go to winner's page
        ReactDOM.render(
            <Winner puzzle={obj.solution} winner={obj.winner} prize={obj.prize} />,
            document.getElementById('content')
        );

        // save winnings
        if (curAccount.username === obj.winner) {
            helper.sendPost("/addWinnings", { winnings: obj.prize });
        }
    }
}

// a new letter is revealed
const updatePuzzle = (puzzle) => {
    ReactDOM.render(
        <GamePage puzzle={puzzle} />,
        document.getElementById('content')
    );
}

const init = async () => {
    curAccount = await helper.getAccountInfo();

    // start on the joining page
    ReactDOM.render(
        <JoiningPage />,
        document.getElementById('content')
    );

    // someone joins the room
    socket.on('newUser', updatePlayerCount);

    // enough players have joined, now start game
    socket.on('gameStart', renderGamePage);

    // someone has made a request to start typing
    socket.on('beginTyping', someoneTyping);

    // when a new letter is revealed
    socket.on('gameUpdate', updatePuzzle);

    // when someone is typing their answer
    socket.on('userTyped', updatePuzzle);

    // someone inputted an incorrect guess
    socket.on('gameResume', resumeGame);

    // someone inputted a correct guess
    socket.on('gameSolved', gotoResults);

    // now that the socket is set up, try to join room
    socket.emit('joinRoom');
}

window.onload = init;
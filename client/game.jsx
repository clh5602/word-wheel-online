const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

// shows when viewing the leaderboard
const JoiningPage = (props) => {
    return (
        <div class="settings">
            <h1>Joining Game...</h1>
            <h2>Party: 1/3</h2>
            <p>This game is not yet complete. Basically, it will use Socket.IO to play Wheel-Of-Fortune style
                toss-up puzzles with a room of 3 people. Whoever buzzes in with the correct answer will receive
                points based on how quickly they buzzed in, and these points will be saved to their account.
            </p>
        </div>
    );
};

const init = () => {

    ReactDOM.render(
        <JoiningPage />,
        document.getElementById('content')
    );

}

window.onload = init;